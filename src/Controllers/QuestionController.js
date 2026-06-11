const RedisService = require("../Services/RedisService");
const QuestionService = require("../Services/QuestionService");
const StudentService = require("../Services/StudentService");
const KeyboardFactory = require("../Services/KeyboardFactory");
const LessonTaskController = require("./LessonTaskController");
const HomeworkController = require("./HomeworkController");
const LessonService = require("../Services/LessonService");
const ExamService = require("../Services/ExamService");
const ExamController = require("./ExamController");

const questionService = new QuestionService();
const studentService = new StudentService();
const lessonService = new LessonService();
const examService = new ExamService();

class QuestionController {
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('start_task:')) {
                const [, entityId, entityType] = callbackData.split(':');
                await QuestionController.startTask(ctx, parseInt(entityId), entityType);
            } else if (callbackData.startsWith('question_toggle_multi:')) {
                const [, entityType, questionIdStr, optionKey, entityIdStr] = callbackData.split(':');
                await QuestionController.toggleMultiOption(ctx, parseInt(entityIdStr), parseInt(questionIdStr), optionKey, entityType);
            } else if (callbackData.startsWith('question_select_single:')) {
                const [, entityType, questionIdStr, optionKey, entityIdStr] = callbackData.split(':');
                await QuestionController.selectSingleOption(ctx, parseInt(entityIdStr), parseInt(questionIdStr), optionKey, entityType);
            } else if (callbackData.startsWith('question_await_text:')) {
                const [, entityType, questionIdStr, entityIdStr] = callbackData.split(':');
                await QuestionController.awaitTextAnswer(ctx, parseInt(entityIdStr), parseInt(questionIdStr), entityType);
            } else if (callbackData.startsWith('question_nav:')) {
                const [, entityType, entityIdStr, indexStr] = callbackData.split(':');
                await QuestionController.renderQuestionByIndex(ctx, parseInt(entityIdStr), parseInt(indexStr), entityType);
            } else if (callbackData.startsWith('question_finish:')) {
                const [, entityType, entityIdStr] = callbackData.split(':');
                await QuestionController.finishTask(ctx, parseInt(entityIdStr), entityType);
            } else if (callbackData.startsWith('question_show_progress:')) {
                const [, entityType, entityIdStr] = callbackData.split(':');
                await QuestionController.showProgress(ctx, parseInt(entityIdStr), entityType);
            } else if (callbackData.startsWith('question_restart:')) {
                const [, entityType, entityIdStr] = callbackData.split(':');
                await QuestionController.restartTask(ctx, parseInt(entityIdStr), entityType);
            } else if (callbackData.startsWith('question_back_to_task:')) {
                const [, entityType, entityIdStr] = callbackData.split(':');
                await QuestionController.backToEntity(ctx, parseInt(entityIdStr), entityType);
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    static async backToEntity(ctx, entityId, entityType) {
        try {
            switch (entityType) {
                case 'lesson_task': {
                    await LessonTaskController.backToTask(ctx, entityId);
                    break;
                }
                case 'homework': {
                    await HomeworkController.backToHomework(ctx, entityId);
                    break;
                }
                case 'exam': {
                    await ExamController.backToExam(ctx, entityId);
                }
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    /**
     * Начать выполнение задания
     */
    static async startTask(ctx, entityId, entityType) {
        try {
            const questions = await questionService.getQuestionsByEntity(entityId, entityType);
            if (!questions || questions.length === 0) {
                await ctx.answerCallbackQuery('❌ Вопросов нет');
                return;
            }
            const ordered = questions.sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
            const questionIds = ordered.map(q => q.id);
            const userId = ctx.from.id.toString();

            // 🔥 Проверяем, не запущен ли уже таймер для экзамена
            if (entityType === 'exam') {
                const existingTimer = await RedisService.getExamStartTime(userId, entityId);
                if (existingTimer) {
                    // Таймер уже идёт — просто рендерим первый вопрос
                    await QuestionController.renderQuestionByIndex(ctx, entityId, 0, entityType);
                    return;
                }
            }
            // Если это экзамен, запускаем таймер
            if (entityType === 'exam') {
                const exam = await examService.getExam(entityId); // нужно реализовать получение экзамена
                if (exam && exam.timeLimit > 0) {
                    await RedisService.saveExamStartTime(userId, entityId);
                }
            }
            await RedisService.saveTaskProgress(userId, entityId, questionIds, 0, entityType);
            await QuestionController.renderQuestionByIndex(ctx, entityId, 0, entityType);
        } catch (error) {
            console.error(`Error in startTask (${entityType}):`, error);
            await ctx.answerCallbackQuery('❌ Ошибка при начале задания');
        }
    }

    static async updateQuestionMessage(ctx, text, keyboard, mediaUrl = null, isNewMessage = false) {
        const currentMsg = ctx.callbackQuery?.message;
        const isCurrentPhoto = !!currentMsg?.photo;
        const isNextPhoto = !!mediaUrl;

        // Если это новое сообщение или типы не совпадают – удаляем старое и отправляем новое
        if (isNewMessage || (isCurrentPhoto !== isNextPhoto)) {
            try {
                await ctx.deleteMessage();
            } catch (e) {
                // сообщение могло быть уже удалено
            }

            if (isNextPhoto) {
                await ctx.replyWithPhoto(mediaUrl, {
                    caption: text,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } else {
                await ctx.reply(text, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
            return;
        }

        // Типы совпадают – редактируем существующее
        if (isNextPhoto) {
            await ctx.editMessageMedia({
                type: 'photo',
                media: mediaUrl,
                caption: text,
                parse_mode: 'Markdown'
            }, { reply_markup: keyboard });
        } else {
            await ctx.editMessageText(text, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
    }

    /**
     * Отображение вопроса по индексу
     */
    static async renderQuestionByIndex(ctx, entityId, index, entityType, isNewMessage = false) {
        try {
            const userId = ctx.from.id.toString();

            if (entityType === 'exam') {
                const timeoutHandled = await QuestionController.checkAndHandleExamTimeout(ctx, entityId, entityType);
                if (timeoutHandled) return;
            }

            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            if (!progress) {
                await QuestionController.startTask(ctx, entityId, entityType);
                return;
            }

            const totalQuestions = progress.questionIds.length;
            const safeIndex = Math.max(0, Math.min(index, totalQuestions - 1));
            const questionId = progress.questionIds[safeIndex];

            await RedisService.updateCurrentQuestion(userId, entityId, safeIndex, entityType);

            // Загружаем вопрос с файлами
            const question = await questionService.getQuestionByIdWithFiles(questionId);
            if (!question) {
                await ctx.answerCallbackQuery('❌ Вопрос не найден');
                return;
            }

            question.userAnswer = await QuestionController.getUserAnswer(userId, questionId, question.questionType, entityType);

            let message = `Вопрос ${safeIndex + 1}/${totalQuestions}:\n`;

            if (entityType === 'exam') {
                const exam = await examService.getExam(entityId);
                if (exam && exam.timeLimit > 0) {
                    const remaining = await RedisService.getExamRemainingTime(userId, entityId, exam.timeLimit);
                    if (remaining !== null) {
                        const minutes = Math.floor(remaining / 60);
                        const seconds = Math.floor(remaining % 60);
                        message += `Оставшееся время: ${minutes}:${seconds.toString().padStart(2, '0')}\n\n`;
                    }
                }
            }

            message += `${question.question}\n`;

            if (question.questionType === 'multiple_choice' || question.questionType === 'single_choice') {
                const options = typeof question.options === 'string'
                    ? JSON.parse(question.options)
                    : question.options;
                options.forEach((option, idx) => {
                    message += `\n${idx + 1}: ${option.text}`;
                });
            }

            if ((question.questionType === 'text' || question.questionType === 'free_text') && question.userAnswer) {
                const preview = question.userAnswer.length > 200
                    ? `${question.userAnswer.slice(0, 200)}…`
                    : question.userAnswer;
                message += `\nВаш ответ: \n${preview}\n`;
            }

            const answers = await RedisService.getUserTaskAnswers(userId, entityId, progress.questionIds, entityType);
            const answered = Object.keys(answers).length;
            const hint = question?.explanation;
            if (hint && hint.notEmpty > 0) {
                message += `\n*Подсказка:* ${question.explanation}\n`;
            }

            const keyboard = KeyboardFactory.createQuestionNavigation(question, entityId, safeIndex, totalQuestions, answered, entityType);

            // Поиск изображения в файлах вопроса
            let imageUrl = null;
            if (question.files && question.files.length > 0) {
                const imageFile = question.files.find(f => f.mime_type && f.mime_type.startsWith('image/'));
                if (imageFile) {
                    // Строим полный URL (замените на свою логику)
                    const BASE_STORAGE_URL = process.env.FILE_STORAGE_URL || 'https://edubot.fun';
                    const encodedPath = imageFile.path.split('/').map(encodeURIComponent).join('/');
                    imageUrl = `${BASE_STORAGE_URL}/storage/${encodedPath}`;
                }
            }

            await QuestionController.updateQuestionMessage(ctx, message, keyboard, imageUrl, isNewMessage);

        } catch (error) {
            console.error('Ошибка при отображении вопроса:', error);
            const errorMessage = '❌ Не удалось отобразить вопрос';
            if (isNewMessage) {
                await ctx.reply(errorMessage);
            } else {
                await ctx.answerCallbackQuery(errorMessage);
            }
        }
    }


    /**
     * Вспомогательный метод для получения ответа пользователя
     */
    static async getUserAnswer(userId, questionId, questionType, entityType) {
        switch (questionType) {
            case 'multiple_choice':
                return await RedisService.getUserSelectedOptions(userId, questionId, entityType);
            case 'single_choice':
                return await RedisService.getUserSelectedOption(userId, questionId, entityType);
            case 'text':
                return await RedisService.getUserTextAnswer(userId, questionId, entityType);
            case 'free_text':
                return await RedisService.getUserTextAnswer(userId, questionId, entityType);
            default:
                return null;
        }
    }

    /**
     * Обработка multiple choice
     */
// Исправление поиска индекса во всех методах
    static async toggleMultiOption(ctx, entityId, questionId, optionKey, entityType) {
        try {
            if (entityType === 'exam') {
                const timeoutHandled = await QuestionController.checkAndHandleExamTimeout(ctx, entityId, entityType);
                if (timeoutHandled) return;
            }

            const userId = ctx.from.id.toString();
            await RedisService.toggleUserOption(userId, questionId, optionKey, entityType);

            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            const index = progress?.questionIds.findIndex(id => id == questionId) ?? 0;

            await QuestionController.renderQuestionByIndex(ctx, entityId, index, entityType);
        } catch (error) {
            console.error('Ошибка toggleMultiOption:', error);
            await ctx.answerCallbackQuery('❌ Ошибка выбора');
        }
    }

    static async selectSingleOption(ctx, entityId, questionId, optionKey, entityType) {
        try {
            if (entityType === 'exam') {
                const timeoutHandled = await QuestionController.checkAndHandleExamTimeout(ctx, entityId, entityType);
                if (timeoutHandled) return;
            }

            const userId = ctx.from.id.toString();
            await RedisService.setUserOption(userId, questionId, optionKey, entityType);

            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            const index = progress?.questionIds.findIndex(id => id == questionId) ?? 0;

            await QuestionController.renderQuestionByIndex(ctx, entityId, index, entityType);
        } catch (error) {
            console.error('Ошибка selectSingleOption:', error);
            await ctx.answerCallbackQuery('❌ Ошибка выбора');
        }
    }

    static async awaitTextAnswer(ctx, entityId, questionId, entityType) {
        try {
            if (entityType === 'exam') {
                const timeoutHandled = await QuestionController.checkAndHandleExamTimeout(ctx, entityId, entityType);
                if (timeoutHandled) return;
            }
            const userId = ctx.from.id.toString();
            await RedisService.setAwaitingTextAnswer(userId, entityId, questionId, entityType);
            await ctx.answerCallbackQuery('✏️ Введите текст ответа сообщением ниже');
            await ctx.reply('⬇️ Введите ваш текстовый ответ в этом чате:');
        } catch (error) {
            console.error('Ошибка awaitTextAnswer:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при ожидании текста');
        }
    }

    /**
     * Обработка текстового ответа
     */
    static async handleTextAnswer(ctx) {
        try {
            const userId = ctx.from.id.toString();
            const awaiting = await RedisService.getAwaitingTextAnswer(userId);
            if (!awaiting) return false;

            const { entityId, questionId, entityType } = awaiting;
            if (entityType === 'exam') {
                const timeoutHandled = await QuestionController.checkAndHandleExamTimeout(ctx, entityId, entityType);
                if (timeoutHandled) return true;
            }


            const text = ctx.message.text?.trim();
            if (!text) {
                await ctx.reply('❌ Ответ пуст. Введите текст или нажмите кнопки навигации.');
                return true;
            }

            await RedisService.setUserTextAnswer(userId, questionId, text, entityType);
            await RedisService.clearAwaitingTextAnswer(userId, entityType);

            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            const index = progress?.questionIds.findIndex(id => id == questionId) ?? 0;

            await QuestionController.renderQuestionByIndex(ctx, entityId, index, entityType, true);
            return true;
        } catch (error) {
            console.error('Ошибка handleTextAnswer:', error);
            return false;
        }
    }

    /**
     * Показать прогресс
     */
    static async showProgress(ctx, entityId, entityType) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);

            if (!progress) {
                await ctx.answerCallbackQuery('❌ Прогресс не найден');
                return;
            }

            const questionIds = progress.questionIds;
            const answers = await RedisService.getUserTaskAnswers(userId, entityId, questionIds, entityType);
            const answered = Object.keys(answers).length;

            const message = `📊 Прогресс: ${answered}/${progress.questionIds.length}`;
            const keyboard = KeyboardFactory.createProgressKeyboard(entityId, progress.currentIndex ?? 0, entityType);

            // Прогресс показываем всегда текстом (без картинки)
            await QuestionController.updateQuestionMessage(ctx, message, keyboard, null, true);
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка showProgress:', error);
            await ctx.answerCallbackQuery('❌ Не удалось показать прогресс');
        }
    }

    /**
     * Перезапуск задания
     */
    static async restartTask(ctx, entityId, entityType) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);

            if (progress) {
                for (const qId of progress.questionIds) {
                    await RedisService.clearUserQuestionState(userId, qId, entityType);
                    await RedisService.clearUserTextAnswer(userId, qId, entityType);
                }
                await RedisService.clearTaskProgress(userId, entityId, entityType);
                await RedisService.saveTaskProgress(userId, entityId, progress.questionIds, 0, entityType);
            }

            // Удаляем предыдущее сообщение и показываем первый вопрос как новое
            try { await ctx.deleteMessage(); } catch (e) {}
            await QuestionController.renderQuestionByIndex(ctx, entityId, 0, entityType, true);
        } catch (error) {
            console.error('Ошибка restartTask:', error);
            await ctx.answerCallbackQuery('❌ Не удалось начать заново');
        }
    }

    /**
     * Завершение задания
    /**
     * Завершение задания
     * @param {Object} ctx - Контекст Grammy
     * @param {number} entityId - ID сущности
     * @param {string} entityType - Тип сущности
     * @param {Object} options - Дополнительные опции: { timeout: boolean }
     */
    static async finishTask(ctx, entityId, entityType, options = {}) {
        try {
            const userId = ctx.from.id.toString();
            const studentId = ctx.state?.student?.id;
            const organizationId = ctx.state?.student?.organization_id;
            const { timeout = false } = options;

            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            if (!progress) {
                await ctx.answerCallbackQuery('❌ Прогресс не найден');
                return;
            }

            const questionIds = progress.questionIds;
            const answers = await RedisService.getUserTaskAnswers(userId, entityId, questionIds, entityType);

            if (!timeout && questionIds.length !== Object.keys(answers).length) {
                await ctx.answerCallbackQuery('❌ Не все вопросы решены!');
                return;
            }

            const questions = await questionService.getQuestionsByIds(questionIds);
            const hasFreeText = questions.some(q => q.questionType === 'free_text');
            const result = await questionService.calculateResults(questionIds, answers);
            const maxPoints = await questionService.getMaxScore(entityType, entityId);

            const resultsLines = [];

            if (timeout) {
                resultsLines.push(`⏰ Время вышло!`);
            }

            resultsLines.push(`Результат: ${result.earnedPoints}/${maxPoints}`);
            const checked = !hasFreeText;

            if (studentId) {
                const bestResult = await studentService.findBestResult(studentId, entityType, entityId);

                await studentService.saveStudentResults({
                    organizationId,
                    studentId,
                    checked,
                    points: result.earnedPoints,
                    maxPoints: maxPoints,
                    answers: Object.entries(answers).map(([qId, answer]) => ({
                        question_id: parseInt(qId),
                        answer: answer
                    })),
                    progressableId: entityId,
                    progressableType: entityType,
                    finishedByTimeout: timeout,
                });

                const previousBest = bestResult?.points ?? 0;
                const awardedPoints = result.earnedPoints - previousBest;

                if (!bestResult) {
                    resultsLines.push(`🎯 Первая попытка!`);
                    await studentService.addPoints(studentId, result.earnedPoints);
                } else if (awardedPoints > 0) {
                    resultsLines.push(`🎉 Новый рекорд! Прошлый лучший: ${previousBest}/${maxPoints}`);
                    await studentService.addPoints(studentId, awardedPoints);
                } else if (awardedPoints === 0 && bestResult) {
                    resultsLines.push(`📊 Такой же результат как в лучшей попытке: ${previousBest}/${maxPoints}`);
                } else {
                    resultsLines.push(`📊 Текущий результат: ${result.earnedPoints}/${maxPoints} (лучший: ${previousBest}/${maxPoints})`);
                }

                let lessonId = null;
                let moduleId = null;

                if (entityType === 'lesson_task') {
                    const task = await lessonService.getTaskContext(entityType, entityId);
                    lessonId = task?.lessonId;
                    moduleId = task?.moduleId;
                }

                if (lessonId) {
                    const homework = await studentService.assignHomeworkIfReady(studentId, lessonId);
                    if (homework) resultsLines.push(`Доступно новое домашнее задание!`);
                }
                if (moduleId) {
                    const exam = await studentService.assignExamIfReady(studentId, moduleId);
                    if (exam) resultsLines.push(`📝 Доступен новый экзамен!`);
                }
            }

            // Очищаем прогресс
            await QuestionController.cleanupProgress(userId, progress, entityType);
            if (entityType === 'exam') {
                await RedisService.clearExamTimer(userId, entityId);
                await RedisService.clearExamTimeoutFlag(userId, entityId); // 🔥 Очищаем флаг
            }

            const message = resultsLines.join('\n');
            const keyboard = KeyboardFactory.createResultsKeyboard(entityId, entityType);

            if (timeout) {
                await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'Markdown' });
            } else {
                await QuestionController.updateQuestionMessage(ctx, message, keyboard, null, false);
                await ctx.answerCallbackQuery();
            }
            await ctx.answerCallbackQuery();

        } catch (error) {
            console.error('Ошибка finishTask:', error);
            await ctx.answerCallbackQuery('❌ Не удалось завершить задание');
        }
    }

    /**
     * Проверяет, истекло ли время экзамена, и при необходимости завершает его
     * @returns {Promise<boolean>} true, если время истекло и экзамен завершен
     */
    static async checkAndHandleExamTimeout(ctx, entityId, entityType) {
        if (entityType !== 'exam') return false;

        try {
            const userId = ctx.from.id.toString();
            const exam = await examService.getExam(entityId);

            if (!exam || exam.timeLimit <= 0) return false;

            const remaining = await RedisService.getExamRemainingTime(userId, entityId, exam.timeLimit);

            if (remaining !== null && remaining <= 0) {
                // Время истекло - завершаем экзамен с флагом timeout
                // Сохраняем флаг в Redis
                await RedisService.saveExamTimeoutFlag(userId, entityId, true);
                await QuestionController.finishTask(ctx, entityId, entityType, { timeout: true });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка при проверке таймера экзамена:', error);
            return false; // Не блокируем пользователя при ошибке
        }
    }

    static async forceFinishExam(ctx, entityId, entityType) {
        return await QuestionController.finishTask(ctx, entityId, entityType, { timeout: true });
    }

    static async cleanupProgress(userId, progress, entityType) {
        for (const qId of progress.questionIds) {
            await RedisService.clearUserQuestionState(userId, qId, entityType);
            await RedisService.clearUserTextAnswer(userId, qId, entityType);
        }
        await RedisService.clearTaskProgress(userId, progress.entityId, entityType);
    }
}

module.exports = QuestionController;