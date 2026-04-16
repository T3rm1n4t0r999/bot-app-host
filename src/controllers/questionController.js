const RedisService = require("../services/redisService");
const QuestionService = require("../services/QuestionService");
const StudentService = require("../services/studentService");
const KeyboardFactory = require("../services/keyboardFactory");
const LessonTaskController = require("./lessonTaskController");
const HomeworkController = require("./homeworkController");
const HomeworkService = require("../services/homeworkService");
const {InlineKeyboard} = require("grammy");

const questionService = new QuestionService();
const studentService = new StudentService();
const homeworkService = new HomeworkService();

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
            await RedisService.saveTaskProgress(userId, entityId, questionIds, 0, entityType);
            await QuestionController.renderQuestionByIndex(ctx, entityId, 0, entityType);
        } catch (error) {
            console.error(`Error in startTask (${entityType}):`, error);
            await ctx.answerCallbackQuery('❌ Ошибка при начале задания');
        }
    }

    /**
     * Отображение вопроса по индексу
     */
    static async renderQuestionByIndex(ctx, entityId, index, entityType, isNewMessage = false) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            if (!progress) {
                await QuestionController.startTask(ctx, entityId, entityType);
                return;
            }
            const totalQuestions = progress.questionIds.length;
            const safeIndex = Math.max(0, Math.min(index, totalQuestions - 1));
            const questionId = progress.questionIds[safeIndex];

            await RedisService.updateCurrentQuestion(userId, entityId, safeIndex, entityType);
            const question = await questionService.getQuestionById(questionId);


            // Получаем ответ пользователя
            question.userAnswer = await QuestionController.getUserAnswer(userId, questionId, question.questionType, entityType);

            let message = `Вопрос ${safeIndex + 1}/${totalQuestions}:\n\n`;
            message += `${question.question}\n`;

            // Добавляем варианты ответов для choice вопросов
            if (question.questionType === 'multiple_choice' || question.questionType === 'single_choice') {
                const options = typeof question.options === 'string'
                    ? JSON.parse(question.options)
                    : question.options;

                options.forEach(option => {
                    message += `\n${option.key}. ${option.value}\n`;
                });
            }

            // Показываем превью текстового ответа
            if ((question.questionType === 'text' || question.questionType === 'code') && question.userAnswer) {
                const preview = question.userAnswer.length > 200
                    ? `${question.userAnswer.slice(0, 200)}…`
                    : question.userAnswer;
                message += `\nВаш ответ: \n${preview}\n`;
            }

            // Получаем статистику ответов
            const questionIds = progress.questionIds;
            const answers = await RedisService.getUserTaskAnswers(userId, entityId, questionIds, entityType);
            const answered = Object.keys(answers).length;

            const keyboard = KeyboardFactory.createQuestionNavigation(question, entityId, safeIndex, totalQuestions, answered, entityType);

            if (isNewMessage) {
                await ctx.reply(message, {
                    reply_markup: keyboard,
                    parse_mode: 'Markdown'
                });
            } else {
                await ctx.editMessageText(message, {
                    reply_markup: keyboard,
                    parse_mode: 'Markdown'
                });
                await ctx.answerCallbackQuery();
            }

        } catch (error) {
            console.error('Ошибка при отображении вопроса:', error);
            const errorMessage = isNewMessage
                ? '❌ Не удалось отобразить вопрос'
                : '❌ Не удалось отобразить вопрос';

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
            case 'code':
                return await RedisService.getUserTextAnswer(userId, questionId, entityType);
            default:
                return null;
        }
    }

    /**
     * Обработка multiple choice
     */
    static async toggleMultiOption(ctx, entityId, questionId, optionKey, entityType) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.toggleUserOption(userId, questionId, optionKey, entityType);
            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            const index = progress?.questionIds.findIndex(id => id === questionId.toString()) ?? 0;
            await QuestionController.renderQuestionByIndex(ctx, entityId, index, entityType);
        } catch (error) {
            console.error('Ошибка toggleMultiOption:', error);
            await ctx.answerCallbackQuery('❌ Ошибка выбора');
        }
    }

    /**
     * Обработка single choice
     */
    static async selectSingleOption(ctx, entityId, questionId, optionKey, entityType) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.setUserOption(userId, questionId, optionKey, entityType);
            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            const index = progress?.questionIds.findIndex(id => id === questionId.toString()) ?? 0;
            await QuestionController.renderQuestionByIndex(ctx, entityId, index, entityType);
        } catch (error) {
            console.error('Ошибка selectSingleOption:', error);
            await ctx.answerCallbackQuery('❌ Ошибка выбора');
        }
    }

    /**
     * Ожидание текстового ответа
     */
    static async awaitTextAnswer(ctx, entityId, questionId, entityType) {
        try {
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

            const {entityId, questionId, entityType } = awaiting;
            const text = ctx.message.text?.trim();

            if (!text) {
                await ctx.reply('❌ Ответ пуст. Введите текст или нажмите кнопки навигации.');
                return true;
            }

            await RedisService.setUserTextAnswer(userId, questionId, text, entityType);
            await RedisService.clearAwaitingTextAnswer(userId, entityType);

            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);
            const index = progress?.questionIds.findIndex(id => id === questionId.toString()) ?? 0;
            const nextIndex = Math.min(index + 1, (progress?.questionIds.length ?? 1) - 1);

            await QuestionController.renderQuestionByIndex(ctx, entityId, nextIndex, entityType, true);
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

            try {
                await ctx.deleteMessage();
            } catch (error) {
                console.log('Не удалось удалить сообщение:', error);
            }

            await ctx.reply(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
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
                // Очищаем ответы
                for (const qId of progress.questionIds) {
                    await RedisService.clearUserQuestionState(userId, qId, entityType);
                    await RedisService.clearUserTextAnswer(userId, qId, entityType);
                }
                await RedisService.clearTaskProgress(userId, entityId, entityType);
                // Восстанавливаем прогресс
                await RedisService.saveTaskProgress(userId, entityId, progress.questionIds, 0, entityType);
            }

            await QuestionController.renderQuestionByIndex(ctx, entityId, 0, entityType);
        } catch (error) {
            console.error('Ошибка restartTask:', error);
            await ctx.answerCallbackQuery('❌ Не удалось начать заново');
        }
    }

    /**
     * Завершение задания
     */
    static async finishTask(ctx, entityId, entityType) {
        try {
            const userId = ctx.from.id.toString();
            const studentId = ctx.state?.student?.id;
            const progress = await RedisService.getTaskProgress(userId, entityId, entityType);

            if (!progress) {
                await ctx.answerCallbackQuery('❌ Прогресс не найден');
                return;
            }

            const questionIds = progress.questionIds;
            const answers = await RedisService.getUserTaskAnswers(userId, entityId, questionIds, entityType);

            // Проверяем, что все вопросы отвечены
            if (questionIds.length !== Object.keys(answers).length) {
                await ctx.answerCallbackQuery('❌ Не все вопросы решены!');
                return;
            }
            if (entityId === 36) {
                // 🔥 1. СРАЗУ удаляем сообщение с последним вопросом (до долгих операций!)
                await ctx.deleteMessage().catch(err => {
                    console.log('⚠️ Не удалось удалить вопрос:', err?.description || err?.message);
                });

                // 🔥 2. Сразу отвечаем на callback (Telegram требует ответ за 3 сек)
                await ctx.answerCallbackQuery('⏳ Проверяю ответы...').catch(() => {
                });
            }
            // Вычисляем результаты
            const result = await questionService.calculateResults(questionIds, answers);
            const resultsLines = [];
            resultsLines.push(`Результат: ${result.earnedPoints}/${result.maxPoints}`);

            // Сохраняем результаты для студента
            if (studentId) {
                const bestResult = await studentService.findBestResult(studentId, entityType, entityId);

                await studentService.saveStudentResults({
                    studentId: studentId,
                    points: result.earnedPoints,
                    answers: answers,
                    progressableId: entityId,
                    progressableType: entityType
                });

                let isNewRecord = false;
                const awardedPoints =  result.earnedPoints - (bestResult?.points ?? 0);
                if (awardedPoints > 0) {
                    isNewRecord = true;
                }

                if (!bestResult) {
                    resultsLines.push(`🎯 Первая попытка!`);
                    if(entityType === 'lesson_task')
                        await homeworkService.addHomeworkToStudentByTaskId(studentId, entityId);
                } else if (isNewRecord) {
                    resultsLines.push(`🎉 Новый рекорд! Прошлый лучший результат: ${bestResult?.points}/${result.maxPoints}`);
                } else if (bestResult?.points === result.earnedPoints) {
                    resultsLines.push(`📊 Такой же результат как в лучшей попытке: ${result.earnedPoints}/${result.maxPoints}`);
                } else {
                    resultsLines.push(`📊 Текущий результат: ${result.earnedPoints}/${result.maxPoints} (лучший: ${bestResult?.points}/${result.maxPoints})`);
                }

                // Начисляем баллы
                if (awardedPoints > 0) {
                   await studentService.addPoints(studentId, awardedPoints);
                }
            }

            // Очищаем прогресс
            for (const qId of progress.questionIds) {
                await RedisService.clearUserQuestionState(userId, qId, entityType);
                await RedisService.clearUserTextAnswer(userId, qId, entityType);
            }
            await RedisService.clearTaskProgress(userId, entityId, entityType);

            if (entityId === 36) {
                await QuestionController.finishQuizAndReward(
                    ctx,
                    result.earnedPoints,  // score
                    result.maxPoints,     // total
                    entityId              // taskId
                );
            }else{
                const message = resultsLines.join('\n');
                const keyboard = KeyboardFactory.createResultsKeyboard(entityId, entityType);

                await ctx.editMessageText(message, {
                    reply_markup: keyboard,
                    parse_mode: 'Markdown'
                });
                await ctx.answerCallbackQuery();
            }

        } catch (error) {
            console.error('Ошибка finishTask:', error);
            await ctx.answerCallbackQuery('❌ Не удалось завершить задание');
        }
    }

    static async safeSendText(ctx, text, keyboard, parseMode = 'Markdown') {
        try {
            await ctx.editMessageText(text, {
                reply_markup: keyboard,
                parse_mode: parseMode
            });
        } catch (err) {
            const errMsg = err?.message || err?.description || JSON.stringify(err);
            const isMediaError = errMsg.includes('no text in the message') ||
                errMsg.includes('message can\'t be edited') ||
                errMsg.includes('400');

            if (isExcellent) {
                // 🔥 1. Удаляем предыдущее сообщение (с результатами)
                await ctx.deleteMessage().catch(err => {
                    // Игнорируем ошибки, если сообщение уже удалено или старше 48ч
                    console.log('⚠️ Не удалось удалить старое сообщение:', err?.description || err?.message);
                });

                // 🔥 2. Отправляем НОВОЕ сообщение с фото-медалью
                await ctx.replyWithPhoto(
                    medalUrl,
                    {
                        caption: safeMessage,
                        parse_mode: 'Markdown',
                        reply_markup: keyboard
                    }
                );
            } else {
                // Если баллов мало → просто отправляем текстовое сообщение
                await ctx.reply(safeMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        }
    }

    static async finishQuizAndReward(ctx, score, total, taskId) {
        const passedThreshold = 2; // Больше 8 баллов
        const isExcellent = score > passedThreshold;

        // 🔥 ССЫЛКА на картинку (замените на свою)
        const medalUrl = 'https://fs.znanio.ru/8c0997/52/ed/d850d9d7fbaf56d391ba37e20641936a8a.jpg';

        // Формируем текст (Markdown)
        const rawMessage = isExcellent
            ? `🎉 Поздравляем!\n\nТы набрал ${score} баллов из ${total}!\nОтличная работа — вот твоя заслуженная медаль 🏅`
            : `📊 Твой результат: ${score}\* из ${total}\n\nПопробуй ещё раз! Для получения медали нужно набрать больше \*${passedThreshold}\* баллов.`;

        // Экранируем для Markdown
        const safeMessage = rawMessage.replace(/([_*`[\]])/g, '\\$1');

        // Клавиатура
        const keyboard = new InlineKeyboard()
            .text('📚 К уроку', `view_lesson_task:${taskId}`)

        if (isExcellent) {
            // 🔥 Отправляем фото ПО ССЫЛКЕ — просто строка!
            await ctx.replyWithPhoto(
                medalUrl,  // ✅ Просто URL, без InputFile
                {
                    caption: safeMessage,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }
            );
        } else {
            // Только текст, если баллов недостаточно
            await ctx.reply(safeMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
    }

}

module.exports = QuestionController;