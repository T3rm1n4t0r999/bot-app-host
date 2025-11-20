const RedisService = require("../services/redisService");
const KeyboardFactory = require("../services/keyboardFactory");
const LessonService = require("../services/lessonService");
const TaskService = require("../services/taskService");
const StudentService = require("../services/studentService");

const studentService = new StudentService();
const lessonService = new LessonService();
const taskService = new TaskService();

class LessonTaskController {
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_lesson_task:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.showLessonTask(ctx, lessonId);
            }else if (callbackData.startsWith('start_task:')) {
                const lessonTaskId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.startTask(ctx, lessonTaskId);
            }else if (callbackData.startsWith('view_task_question:')) {
                const taskQuestionId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.showTaskQuestion(ctx, taskQuestionId);
            } else if (callbackData.startsWith('toggle_multi:')) {
                const [, questionIdStr, optionKey, taskIdStr] = callbackData.split(':');
                await LessonTaskController.toggleMultiOption(ctx, parseInt(taskIdStr), parseInt(questionIdStr), optionKey);
            } else if (callbackData.startsWith('select_single:')) {
                const [, questionIdStr, optionKey, taskIdStr] = callbackData.split(':');
                await LessonTaskController.selectSingleOption(ctx, parseInt(taskIdStr), parseInt(questionIdStr), optionKey);
            } else if (callbackData.startsWith('await_text:')) {
                const [, questionIdStr, taskIdStr] = callbackData.split(':');
                await LessonTaskController.awaitTextAnswer(ctx, parseInt(taskIdStr), parseInt(questionIdStr));
            } else if (callbackData.startsWith('nav_question:')) {
                const [, taskIdStr, indexStr] = callbackData.split(':');
                await LessonTaskController.renderQuestionByIndex(ctx, parseInt(taskIdStr), parseInt(indexStr));
            } else if (callbackData.startsWith('finish_task:')) {
                const [, taskIdStr] = callbackData.split(':');
                await LessonTaskController.finishTask(ctx, parseInt(taskIdStr));
            } else if (callbackData.startsWith('show_progress:')) {
                const [, taskIdStr] = callbackData.split(':');
                await LessonTaskController.showProgress(ctx, parseInt(taskIdStr));
            } else if (callbackData.startsWith('restart_task:')) {
                const [, taskIdStr] = callbackData.split(':');
                await LessonTaskController.restartTask(ctx, parseInt(taskIdStr));
            // } else if (callbackData.startsWith('back_to_task')) {
            //     const parts = callbackData.split(':');
            //     const lessonTaskId = parts[1] ? parseInt(parts[1]) : null;
            //     if (lessonTaskId) {
            //         await LessonTaskController.showTaskQuestions(ctx, lessonTaskId);
            //     } else {
            //         await ctx.answerCallbackQuery();
            //     }
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Начать выполнение задания
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     */
    static async startTask(ctx, taskId) {
        try {
            const taskQuestions = await lessonService.getTaskQuestionsByLessonTaskId(taskId);
            if (!taskQuestions || taskQuestions.length === 0) {
                await ctx.answerCallbackQuery('Вопросов нет');
                return;
            }
            const ordered = taskQuestions.sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
            const questionIds = ordered.map(q => q.id);
            const userId = ctx.from.id.toString();
            await RedisService.saveTaskProgress(userId, taskId, questionIds, 0);

            await LessonTaskController.renderQuestionByIndex(ctx, taskId, 0);
        } catch (e) {
            console.error('Error in showTaskQuestions:', e);
            await ctx.answerCallbackQuery('Ошибка при открытии вопросов');
        }
    }

    /**
     * Показать задание
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param lessonId - ID урока
     */
    static async showLessonTask(ctx, lessonId) {
        try {
            const tasks = await lessonService.showLessonTask(lessonId);
            if (!tasks || tasks.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет заданий.');
                return;
            }
            ctx.lessonId = lessonId;
            const task = tasks[0]
            const keyboard = KeyboardFactory.createTaskKeyboard(lessonId, task.id);
            const message = 'Задание урока:\n\n'+
                                    `📖 *Название*: ${task.title}\n`+
                                    `🏆 *Максимально баллов*: ${task.maxScore}\n`;

            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Показать вопрос
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskQuestionId - ID вопроса
     */
    static async showTaskQuestion(ctx, taskQuestionId) {
        try {
            const taskQuestion = await lessonService.getTaskQuestionById(taskQuestionId);
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, taskQuestion.taskId);
            let index = 0;
            if (progress && Array.isArray(progress.questionIds)) {
                index = progress.questionIds.findIndex(id => id === taskQuestionId.toString());
                if (index < 0) index = 0;
            }
            await LessonTaskController.renderQuestionByIndex(ctx, taskQuestion.taskId, index);
        } catch (e) {
            console.error('Error getting task question:', taskQuestionId, e);
            await ctx.answerCallbackQuery('Ошибка при получении вопроса');
        }
    }

    /**
     * обработка показа вопроса по индексу
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     * @param index - индекс текущего вопроса
     * @param isNewMessage - состояние нового сообщение
     */
    static async renderQuestionByIndex(ctx, taskId, index, isNewMessage = false) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, taskId);
            if (!progress) {
                console.log("progress doesn't exist");
                await LessonTaskController.showTaskQuestions(ctx, taskId);
                return;
            }
            const totalQuestions = progress.questionIds.length;
            const safeIndex = Math.max(0, Math.min(index, totalQuestions - 1));
            const questionId = progress.questionIds[safeIndex];
            await RedisService.updateCurrentQuestion(userId, taskId, safeIndex);
            const taskQuestion = await lessonService.getTaskQuestionById(questionId);

            if (taskQuestion.questionType === 'multiple_choice') {
                taskQuestion.userAnswer = await RedisService.getUserSelectedOptions(userId, questionId);
            } else if (taskQuestion.questionType === 'single_choice') {
                taskQuestion.userAnswer = await RedisService.getUserSelectedOption(userId, questionId);
            } else if (taskQuestion.questionType === 'text' || taskQuestion.questionType === 'code') {
                taskQuestion.userAnswer = await RedisService.getUserTextAnswer(userId, questionId);
            }

            let message = `Вопрос ${safeIndex + 1}/${totalQuestions}:\n\n`;
            message += `${taskQuestion.question}\n`;

            if (taskQuestion.questionType === 'multiple_choice' || taskQuestion.questionType === 'single_choice') {
                const options = typeof taskQuestion.options === 'string'
                    ? JSON.parse(taskQuestion.options)
                    : taskQuestion.options;

                options.forEach(option => {
                    message += `\n${option.key}. ${option.value}\n`;
                });
            }

            if ((taskQuestion.questionType === 'text') && taskQuestion.userAnswer) {
                const preview = taskQuestion.userAnswer.length > 200 ? `${taskQuestion.userAnswer.slice(0, 200)}…` : taskQuestion.userAnswer;
                message += `\nВаш ответ: \n${preview}\n`;
            }

            const questionIds = progress.questionIds;
            const answers = await RedisService.getUserTaskAnswers(userId, taskId, questionIds);
            const answered = Object.keys(answers).length;

            const lessonTask = await lessonService.getLessonByLessonTaskId(taskId);
            const lessonId = lessonTask.lessonId;
            const keyboard = KeyboardFactory.createQuestionNavigation(taskQuestion, taskId, safeIndex, totalQuestions, answered, lessonId);

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
            if (isNewMessage) {
                await ctx.reply('❌ Не удалось отобразить вопрос');
            } else {
                await ctx.answerCallbackQuery('❌ Не удалось отобразить вопрос');
            }
        }
    }

    /**
     * Обработка вопроса с несколькими вариантами ответа
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     * @param questionId - ID вопроса
     * @param optionKey - вариант ответа
     */
    static async toggleMultiOption(ctx, taskId, questionId, optionKey) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.toggleUserOption(userId, questionId, optionKey);
            const progress = await RedisService.getTaskProgress(userId, taskId);
            const index = progress?.questionIds.findIndex(id => id === questionId.toString()) ?? 0;
            // Используем старый метод с редактированием
            await LessonTaskController.renderQuestionByIndex(ctx, taskId, index);
        } catch (error) {
            console.error('Ошибка toggleMultiOption:', error);
            await ctx.answerCallbackQuery('Ошибка выбора');
        }
    }

    /**
     * Обработка вопроса с одним вариантом ответа
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     * @param questionId - ID вопроса
     * @param optionKey - вариант ответа
     */
    static async selectSingleOption(ctx, taskId, questionId, optionKey) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.setUserOption(userId, questionId, optionKey);
            const progress = await RedisService.getTaskProgress(userId, taskId);
            const index = progress?.questionIds.findIndex(id => id === questionId.toString()) ?? 0;
            // Используем старый метод с редактированием
            await LessonTaskController.renderQuestionByIndex(ctx, taskId, index);
        } catch (error) {
            console.error('Ошибка selectSingleOption:', error);
            await ctx.answerCallbackQuery('Ошибка выбора');
        }
    }

    /**
     * Ожидание ответа пользователя
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     * @param questionId - ID вопроса
     */
    static async awaitTextAnswer(ctx, taskId, questionId) {
        try {
            const userId = ctx.from.id.toString();
            await RedisService.setAwaitingTextAnswer(userId, taskId, questionId);
            await ctx.answerCallbackQuery('✏️ Введите текст ответа сообщением ниже');


            await ctx.reply('⬇️ Введите ваш текстовый ответ в этом чате:');
        } catch (error) {
            console.error('Ошибка awaitTextAnswer:', error);
            await ctx.answerCallbackQuery('Ошибка при ожидании текста');
        }
    }

    /**
     * Обработка вопроса с письменным ответом
     * @param {import('grammy').Context} ctx - Контекст бота
     */
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
            const index = progress?.questionIds.findIndex(id => id === questionId.toString()) ?? 0;

            const nextIndex = Math.min(index + 1, (progress?.questionIds.length ?? 1) - 1);

            await LessonTaskController.renderQuestionByIndex(ctx, taskId, nextIndex, true);
            return true;
        } catch (error) {
            console.error('Ошибка handleTextAnswer:', error);
            return false;
        }
    }

    /**
     * Показать прогресс задания
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     */
    static async showProgress(ctx, taskId) {
        try {
            const userId = ctx.from.id.toString();
            const progress = await RedisService.getTaskProgress(userId, taskId);
            if (!progress) {
                await ctx.answerCallbackQuery('Прогресс не найден');
                return;
            }

            const questionIds = progress.questionIds;
            const answers = await RedisService.getUserTaskAnswers(userId, taskId, questionIds);
            const answered = Object.keys(answers).length

            const message = `📊 Прогресс: ${answered.length}\`/\`${progress.questionIds.length}`;
            const keyboard = KeyboardFactory.createProgressKeyboard(taskId, progress.currentIndex ?? 0);

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
            await ctx.answerCallbackQuery('Не удалось показать прогресс');
        }
    }

    /**
     * Начать задание сначала
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     */
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
            await LessonTaskController.renderQuestionByIndex(ctx, taskId, 0);
        } catch (error) {
            console.error('Ошибка restartTask:', error);
            await ctx.answerCallbackQuery('Не удалось начать заново');
        }
    }

    /**
     * Закончить решение задания
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID задания
     */
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

            if (questionIds.length !== Object.keys(answers).length)
            {
                await ctx.answerCallbackQuery('Не все вопросы решены!');
                return;
            }

            let earnedPoints = 0;
            let maxPoints = 0;

            for (const qId of questionIds) {
                const question = await lessonService.getTaskQuestionById(qId);
                const qPoints = question.points || 0;
                maxPoints += qPoints;

                const userAnswer = answers[qId];

                if (question.questionType === 'single_choice' || question.questionType === 'multiple_choice') {
                    const correctAnswers = Array.isArray(question.correctAnswers)
                        ? question.correctAnswers
                        : (typeof question.correctAnswers === 'string'
                            ? JSON.parse(question.correctAnswers)
                            : []);

                    // Нормализуем ответы пользователя к массиву
                    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

                    // Сортируем для сравнения (для multiple_choice)
                    const sortedCorrect = [...correctAnswers].sort();
                    const sortedUser = [...userAnswers].sort();

                    const isCorrect = question.questionType === 'multiple_choice'
                        ? sortedCorrect.length === sortedUser.length &&
                        sortedCorrect.every((val, idx) => val === sortedUser[idx])
                        : userAnswers.length > 0 && correctAnswers.includes(userAnswers[0]);

                    if (isCorrect) earnedPoints += qPoints;
                }
                else if (question.questionType === 'text') {
                    const correctAnswers = Array.isArray(question.correctAnswers)
                        ? question.correctAnswers
                        : (typeof question.correctAnswers === 'string'
                            ? JSON.parse(question.correctAnswers)
                            : []);

                    const userText = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
                    const normalizedUserText = userText.toString().toLowerCase().replace(/\s/g, '');

                    const isCorrect = correctAnswers.some(correct =>
                        correct.toString().toLowerCase().replace(/\s/g, '') === normalizedUserText
                    );
                    if (isCorrect) earnedPoints += qPoints;
                }
            }

            const resultsLines = [];
            resultsLines.push(`Результат: ${earnedPoints}/${maxPoints}`);

            if (studentId) {
                // Сохраняем прогресс/результаты в БД
                const { progress: studentProgress, created } = await taskService.findOrCreateProgress(studentId, taskId);
                let maxPrevPoints = studentProgress.points;
                let shouldSave = false;

                if (created) {
                    // Первое прохождение - всегда сохраняем
                    shouldSave = true;
                    resultsLines.push(`🎯 Первая попытка!`);
                } else if (maxPrevPoints < earnedPoints) {
                    // Новый рекорд
                    shouldSave = true;
                    resultsLines.push(`🎉 Новый рекорд! Предыдущий результат: ${maxPrevPoints}/${maxPoints}`);
                } else if (maxPrevPoints === earnedPoints) {
                    resultsLines.push(`📊 Такой же результат как в предыдущей попытке: ${earnedPoints}/${maxPoints}`);
                } else {
                    resultsLines.push(`📊 Текущий результат: ${earnedPoints}/${maxPoints} (лучший: ${maxPrevPoints}/${maxPoints})`);
                }

                if (shouldSave) {
                    const pointsAward = earnedPoints - maxPrevPoints;
                    const awardedStudent = await studentService.addPoints(studentId, pointsAward);
                    const completed_task = await taskService.completeTask(studentId, taskId, {
                        points: pointsAward,
                        answers: answers,
                    });
                }
            }


            // Очистим ответы
            for (const qId of progress.questionIds) {
                await RedisService.clearUserQuestionState(userId, qId);
                await RedisService.clearUserTextAnswer(userId, qId);
            }
            await RedisService.clearTaskProgress(userId, taskId);
            // Восстановим прогресс с начала
            await RedisService.saveTaskProgress(userId, taskId, progress.questionIds, 0);


            const message = resultsLines.join('\n');
            const lessonTask = await lessonService.getLessonByLessonTaskId(taskId);
            const lessonId = lessonTask.lessonId;
            const keyboard = KeyboardFactory.createResultsKeyboard(taskId, lessonId);
            await ctx.editMessageText(message, { reply_markup: keyboard, parse_mode: 'Markdown' });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка finishTask:', error);
            await ctx.answerCallbackQuery('Не удалось завершить задание');
        }
    }
}

module.exports = LessonTaskController;