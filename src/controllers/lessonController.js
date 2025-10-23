const KeyboardFactory = require("../services/keyboardFactory");
const LessonService = require("../services/lessonService");
const ModuleController = require("../controllers/ModuleController");
const {InlineKeyboard} = require("grammy");
const CourseController = require("./courseController");
const RedisService = require("../services/redisService");
const StudentProgressRepository = require("../repository/studentProgressRepository");

const lessonService = new LessonService();

class LessonController {
    /**
     * Показать детали урока
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} lessonId - ID урока
     */
    static async showLessonDetails(ctx, lessonId) {
        try {
            const lesson = await lessonService.getLessonById(lessonId);

            if (!lesson) {
                await ctx.answerCallbackQuery('❌ Урок не найден');
                return;
            }

            let message = `📚 **${lesson.title}**\n\n`;
            if (lesson.description) {
                message += `${lesson.description}`;
            }

            const keyboard = KeyboardFactory.createLessonNavigationKeyboard(lesson.moduleId, lesson.id);

            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка в showLessonDetails:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке урока');
        }
    }

    /**
     * Вернуться к урокам модуля
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} moduleId - ID модуля
     */
    static async backToLessons(ctx, moduleId) {
        try {
            await ModuleController.showModuleLessons(ctx, moduleId);
        } catch (error) {
            console.error('Ошибка в backToLessons:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к урокам');
        }
    }

    /**
     * Обработка callback queries для курсов и модулей
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_lesson:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonDetails(ctx, lessonId);
            } else if (callbackData.startsWith('back_to_lessons:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await LessonController.backToLessons(ctx, moduleId);
            } else if (callbackData.startsWith('view_lesson_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonMaterials(ctx, lessonId);
            }else if (callbackData.startsWith('view_lesson_task:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonTask(ctx, lessonId);
            } else if (callbackData.startsWith('view_lesson_material:')) {
                const materialId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonMaterial(ctx, materialId);
            } else if(callbackData.startsWith('back_to_lesson_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.backToMaterials(ctx, lessonId);
            } else if (callbackData.startsWith('view_material:')) {
                // Поддержка альтернативного callback из старой клавиатуры
                const materialId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonMaterial(ctx, materialId);
            } else if(callbackData.startsWith('back_to_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.backToMaterials(ctx, lessonId);
            }else if (callbackData.startsWith('view_task_questions:')) {
                const lessonTaskId = parseInt(callbackData.split(':')[1]);
                await LessonController.showTaskQuestions(ctx, lessonTaskId);
            }else if (callbackData.startsWith('view_task_question:')) {
                const taskQuestionId = parseInt(callbackData.split(':')[1]);
                await LessonController.showTaskQuestion(ctx, taskQuestionId);
            } else if (callbackData.startsWith('toggle_multi:')) {
                const [, questionIdStr, optionIndexStr, taskIdStr] = callbackData.split(':');
                await LessonController.toggleMultiOption(ctx, parseInt(taskIdStr), parseInt(questionIdStr), parseInt(optionIndexStr));
            } else if (callbackData.startsWith('select_single:')) {
                const [, questionIdStr, optionIndexStr, taskIdStr] = callbackData.split(':');
                await LessonController.selectSingleOption(ctx, parseInt(taskIdStr), parseInt(questionIdStr), parseInt(optionIndexStr));
            } else if (callbackData.startsWith('await_text:')) {
                const [, questionIdStr, taskIdStr] = callbackData.split(':');
                await LessonController.awaitTextAnswer(ctx, parseInt(taskIdStr), parseInt(questionIdStr));
            } else if (callbackData.startsWith('nav_question:')) {
                const [, taskIdStr, indexStr] = callbackData.split(':');
                await LessonController.navigateToQuestionIndex(ctx, parseInt(taskIdStr), parseInt(indexStr));
            } else if (callbackData.startsWith('finish_task:')) {
                const [, taskIdStr] = callbackData.split(':');
                await LessonController.finishTask(ctx, parseInt(taskIdStr));
            } else if (callbackData.startsWith('show_progress:')) {
                const [, taskIdStr] = callbackData.split(':');
                await LessonController.showProgress(ctx, parseInt(taskIdStr));
            } else if (callbackData.startsWith('restart_task:')) {
                const [, taskIdStr] = callbackData.split(':');
                await LessonController.restartTask(ctx, parseInt(taskIdStr));
            } else if (callbackData.startsWith('back_to_tasks')) {
                const parts = callbackData.split(':');
                const taskId = parts[1] ? parseInt(parts[1]) : null;
                if (taskId) {
                    await LessonController.showTaskQuestions(ctx, taskId);
                } else {
                    await ctx.answerCallbackQuery();
                }
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    static async showLessonTask(ctx, lessonId) {
        try {
            const tasks = await lessonService.showLessonTask(lessonId);
            if (!tasks || tasks.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет заданий.');
                return;
            }
            ctx.lessonId = lessonId;
            const task = tasks[0]
            const keyboard = new InlineKeyboard().text('🔙 К уроку', `view_lesson:${lessonId}`).text('Начать выполнение', `view_task_questions:${task.id}`);
            let message = '📚 Задания урока:\n\n';
            message += `${task.title}\n${task.description}\n${task.maxScore}\n${task.difficulty}\n`;
            // Отправляем основное сообщение со списком материалов
            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (e) {
            console.error(e);
        }
    }



    static async showLessonMaterials(ctx, lessonId) {
        try {
            // Получаем материалы урока
            console.log('Error showing lesson materials:');
            const materials = await lessonService.getLessonMaterialsByLessonId(lessonId);
            const keyboard = new InlineKeyboard();
            if (!materials || materials.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет обучающих материалов.');
                return;
            }
            // Сортируем материалы по порядку
            const sortedMaterials = materials.sort((a, b) => a.order - b.order);

            // Формируем сообщение с названиями материалов
            let message = `📚 Обучающие материалы урока:`;

            sortedMaterials.forEach((material, index) => {
                keyboard.text(material.title, `view_material:${material.id}`).row();
            });
            keyboard.text('🔙 К уроку', `view_lesson:${lessonId}`).row();
            // Отправляем основное сообщение со списком материалов
            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Error showing lesson materials:', error);
            await ctx.reply('❌ Произошла ошибка при загрузке материалов урока.');
        }
    }

    static async showLessonMaterial(ctx, materialId) {
        try {
            const material = await lessonService.getMaterialById(materialId);
            let message = `Название урока: ${material.title}\nОписание урока: ${material.content}`;
            const keyboard = new InlineKeyboard().text('К материалам', `back_to_materials:${material.lessonId}`).row();
            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (e) {
        }
    }

    static async showTaskQuestions(ctx, lessonTaskId) {
        try {
            const taskQuestions = await lessonService.getTaskQuestionsByLessonTaskId(lessonTaskId);
            if (!taskQuestions || taskQuestions.length === 0) {
                await ctx.answerCallbackQuery('Вопросов нет');
                return;
            }

            const ordered = taskQuestions.sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
            const questionIds = ordered.map(q => q.id);
            const userId = ctx.from.id.toString();
            await RedisService.saveTaskProgress(userId, lessonTaskId, questionIds, 0);

            await LessonController.navigateToQuestionIndex(ctx, lessonTaskId, 0);
        } catch (e) {
            console.error('Error in showTaskQuestions:', e);
            await ctx.answerCallbackQuery('Ошибка при открытии вопросов');
        }
    }

    static async backToMaterials(ctx, lessonId) {
        try {
            const lesson = await lessonService.getLessonById(lessonId);
            if (!lesson) {
                await ctx.answerCallbackQuery('❌ Урок не найден');
                return;
            }

            await LessonController.showLessonMaterials(ctx, lessonId);
        } catch (error) {
            console.error('Ошибка в backToMaterials:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к модулям');
        }
    }

    static async showTaskQuestion(ctx, taskQuestionId) {
        try {
            const taskQuestion = await lessonService.getTaskQuestionById(taskQuestionId);
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, taskQuestion.taskId);
            let index = 0;
            if (progress && Array.isArray(progress.questionIds)) {
                index = progress.questionIds.findIndex(id => id === taskQuestionId);
                if (index < 0) index = 0;
            }
            await LessonController.renderQuestionByIndex(ctx, taskQuestion.taskId, index);
        } catch (e) {
            console.error('Error getting task question:', taskQuestionId, e);
            await ctx.answerCallbackQuery('Ошибка при получении вопроса');
        }
    }

    static async navigateToQuestionIndex(ctx, taskId, targetIndex) {
        await LessonController.renderQuestionByIndex(ctx, taskId, targetIndex);
    }

    static async renderQuestionByIndex(ctx, taskId, index) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, taskId);
            if (!progress) {
                await LessonController.showTaskQuestions(ctx, taskId);
                return;
            }
            const totalQuestions = progress.questionIds.length;
            const safeIndex = Math.max(0, Math.min(index, totalQuestions - 1));
            const questionId = progress.questionIds[safeIndex];
            await RedisService.updateCurrentQuestion(userId, taskId, safeIndex);

            const taskQuestion = await lessonService.getTaskQuestionById(questionId);

            // Получаем сохраненный ответ
            if (taskQuestion.questionType === 'multiple_choice') {
                taskQuestion.userAnswer = await RedisService.getUserSelectedOptions(userId, questionId);
            } else if (taskQuestion.questionType === 'single_choice') {
                taskQuestion.userAnswer = await RedisService.getUserSelectedOption(userId, questionId);
            } else if (taskQuestion.questionType === 'text' || taskQuestion.questionType === 'code') {
                taskQuestion.userAnswer = await RedisService.getUserTextAnswer(userId, questionId);
            }

            let message = `Вопрос ${safeIndex + 1}/${totalQuestions}:\n\n`;
            message += `${taskQuestion.question}\n`;
            if ((taskQuestion.questionType === 'text' || taskQuestion.questionType === 'code') && taskQuestion.userAnswer) {
                const preview = taskQuestion.userAnswer.length > 200 ? `${taskQuestion.userAnswer.slice(0, 200)}…` : taskQuestion.userAnswer;
                message += `\nВаш ответ: \n${preview}\n`;
            }

            const keyboard = KeyboardFactory.createQuestionNavigation(taskQuestion, taskId, safeIndex, totalQuestions);

            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка при отображении вопроса:', error);
            await ctx.answerCallbackQuery('❌ Не удалось отобразить вопрос');
        }
    }

    static async toggleMultiOption(ctx, taskId, questionId, optionIndex) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.toggleUserOption(userId, questionId, optionIndex);
            const progress = await RedisService.getTaskProgress(userId, taskId);
            const index = progress?.questionIds.findIndex(id => id === questionId) ?? 0;
            await LessonController.renderQuestionByIndex(ctx, taskId, index);
        } catch (error) {
            console.error('Ошибка toggleMultiOption:', error);
            await ctx.answerCallbackQuery('Ошибка выбора');
        }
    }

    static async selectSingleOption(ctx, taskId, questionId, optionIndex) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.setUserOption(userId, questionId, optionIndex);
            const progress = await RedisService.getTaskProgress(userId, taskId);
            const index = progress?.questionIds.findIndex(id => id === questionId) ?? 0;
            await LessonController.renderQuestionByIndex(ctx, taskId, index);
        } catch (error) {
            console.error('Ошибка selectSingleOption:', error);
            await ctx.answerCallbackQuery('Ошибка выбора');
        }
    }

    static async awaitTextAnswer(ctx, taskId, questionId) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.setAwaitingTextAnswer(userId, taskId, questionId);
            await ctx.answerCallbackQuery('Введите текст ответа сообщением');
        } catch (error) {
            console.error('Ошибка awaitTextAnswer:', error);
            await ctx.answerCallbackQuery('Ошибка при ожидании текста');
        }
    }

    static async handleTextAnswer(ctx) {
        try {
            const userId = ctx.from.id.toString();
            const awaiting = await RedisService.getAwaitingTextAnswer(userId);
            if (!awaiting) return false;

            const { taskId, questionId } = awaiting;
            const text = ctx.message.text?.trim();
            if (!text) {
                await ctx.reply('Ответ пуст. Введите текст или нажмите кнопки навигации.');
                return true;
            }

            await RedisService.setUserTextAnswer(userId, questionId, text);
            await RedisService.clearAwaitingTextAnswer(userId);

            const progress = await RedisService.getTaskProgress(userId, taskId);
            const index = progress?.currentIndex ?? 0;

            // Переходим к следующему вопросу, если он есть
            const nextIndex = Math.min(index + 1, (progress?.questionIds.length ?? 1) - 1);
            await LessonController.renderQuestionByIndex(ctx, taskId, nextIndex);
            return true;
        } catch (error) {
            console.error('Ошибка handleTextAnswer:', error);
            return false;
        }
    }

    static async showProgress(ctx, taskId) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, taskId);
            if (!progress) {
                await ctx.answerCallbackQuery('Прогресс не найден');
                return;
            }
            let answered = 0;
            for (const qId of progress.questionIds) {
                const multi = await RedisService.getUserSelectedOptions(userId, qId);
                const single = await RedisService.getUserSelectedOption(userId, qId);
                const text = await RedisService.getUserTextAnswer(userId, qId);
                if ((multi && multi.length > 0) || single !== null || (text && text.length > 0)) {
                    answered++;
                }
            }
            const message = `📊 Прогресс: ${answered}/${progress.questionIds.length}`;
            const keyboard = KeyboardFactory.createProgressKeyboard(taskId, progress.currentIndex ?? 0);
            await ctx.editMessageText(message, { reply_markup: keyboard, parse_mode: 'Markdown' });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка showProgress:', error);
            await ctx.answerCallbackQuery('Не удалось показать прогресс');
        }
    }

    static async restartTask(ctx, taskId) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, taskId);
            if (progress) {
                // Очистим ответы
                for (const qId of progress.questionIds) {
                    await RedisService.clearUserQuestionState(userId, qId);
                    await RedisService.clearUserTextAnswer(userId, qId);
                }
                await RedisService.clearTaskProgress(userId, taskId);
                // Восстановим прогресс с начала
                await RedisService.saveTaskProgress(userId, taskId, progress.questionIds, 0);
            }
            await LessonController.renderQuestionByIndex(ctx, taskId, 0);
        } catch (error) {
            console.error('Ошибка restartTask:', error);
            await ctx.answerCallbackQuery('Не удалось начать заново');
        }
    }

    static async finishTask(ctx, taskId) {
        try {
            const userId = ctx.from.id.toString();
            const studentId = ctx.state?.student?.id;
            const progress = await RedisService.getTaskProgress(userId, taskId);
            if (!progress) {
                await ctx.answerCallbackQuery('Прогресс не найден');
                return;
            }

            const questionIds = progress.questionIds;
            const answers = await RedisService.getUserTaskAnswers(userId, taskId, questionIds);

            let earnedPoints = 0;
            let totalAutoPoints = 0;

            for (const qId of questionIds) {
                const question = await lessonService.getTaskQuestionById(qId);
                const qPoints = question.points || 0;
                if (question.questionType === 'single_choice' || question.questionType === 'multiple_choice') {
                    totalAutoPoints += qPoints;
                    const correct = Array.isArray(question.correctAnswers)
                        ? question.correctAnswers
                        : (typeof question.correctAnswers === 'string' ? JSON.parse(question.correctAnswers) : []);
                    const userAnsRaw = answers[qId];
                    const userAns = Array.isArray(userAnsRaw) ? userAnsRaw : (userAnsRaw === null || userAnsRaw === undefined ? [] : [userAnsRaw]);
                    const sortedCorrect = [...correct].sort((a, b) => a - b);
                    const sortedUser = [...userAns].sort((a, b) => a - b);
                    const isCorrect = sortedCorrect.length === sortedUser.length && sortedCorrect.every((v, i) => v === sortedUser[i]);
                    if (isCorrect) earnedPoints += qPoints;
                }
            }

            const resultsLines = [];
            resultsLines.push(`Результат: ${earnedPoints}/${totalAutoPoints}`);
            const textQuestions = [];
            for (const qId of questionIds) {
                const question = await lessonService.getTaskQuestionById(qId);
                if (question.questionType === 'text' || question.questionType === 'code') {
                    textQuestions.push(qId);
                }
            }
            if (textQuestions.length > 0) {
                resultsLines.push(`Есть ${textQuestions.length} вопрос(а) с текстовым ответом — оценка после проверки.`);
            }

            if (studentId) {
                // Сохраняем прогресс/результаты в БД
                const repo = new StudentProgressRepository();
                await repo.findOrCreateProgress(studentId, taskId, { startedAt: new Date() });
                await repo.completeTask(studentId, taskId, {
                    correctCount: earnedPoints,
                    totalCount: totalAutoPoints,
                    grade: earnedPoints,
                    answers
                });
            }

            // После завершения можно очистить временное состояние
            await RedisService.clearTaskProgress(userId, taskId);

            const message = resultsLines.join('\n');
            const keyboard = KeyboardFactory.createResultsKeyboard(taskId);
            await ctx.editMessageText(message, { reply_markup: keyboard, parse_mode: 'Markdown' });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка finishTask:', error);
            await ctx.answerCallbackQuery('Не удалось завершить задание');
        }
    }


}

module.exports = LessonController;