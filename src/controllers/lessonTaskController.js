const KeyboardFactory = require("../services/keyboardFactory");
const LessonService = require("../services/lessonService");
const logger = require("../logger/logger");
const LessonController = require("../controllers/lessonController");
const lessonService = new LessonService();


class LessonTaskController {
    /**
     * Обработка команд
     * @param ctx
     * @returns {Promise<void>}
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_lesson_task:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.showLessonTask(ctx, lessonId);
            } else if(callbackData.startsWith('back_to_task:')) {
                const taskId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.backToTask(ctx, taskId);
            }else if(callbackData.startsWith('back_to_lesson:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.backToLesson(ctx, lessonId);
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Вернуться к заданию
     * @param ctx
     * @param taskId
     * @returns {Promise<void>}
     */

    static async backToTask(ctx, taskId) {
        try {
            const lessonTask = await lessonService.getLessonByLessonTaskId(taskId);
            const lessonId = lessonTask.lessonId;
            if(!lessonId) {
                await ctx.answerCallbackQuery();
                return
            }
            await LessonTaskController.showLessonTask(ctx, lessonId);
        } catch (e) {
        }
    }

    /**
     * Вернуться к уроку
     * @param ctx
     * @param lessonId
     * @returns {Promise<void>}
     */
    static async backToLesson(ctx, lessonId) {
        await LessonController.showLessonDetails(ctx, lessonId);
    }

    /**
     * Показать задание
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param lessonId - ID урока
     */
    static async showLessonTask(ctx, lessonId) {
        try {
            const tasks = await lessonService.getLessonTask(lessonId);
            if (!tasks || tasks.length === 0) {
                await ctx.answerCallbackQuery('📚 В этом уроке пока нет заданий.');
                return;
            }
            ctx.lessonId = lessonId;
            const task = tasks[0]
            const keyboard = KeyboardFactory.createLessonTaskKeyboard(task.id, lessonId, 'lesson_task');
            const message = 'Задание урока:\n\n'+
                                    `*Название*: ${task.title}\n\n`+
                                    `📖 *Описание*: ${task.description}\n\n`+
                                    `🏆 *Максимально баллов*: ${task.maxScore}\n`;

            await LessonTaskController.safeSendText(ctx, message, keyboard, 'Markdown');
            await ctx.answerCallbackQuery();
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    static async sendWithDelete(ctx, text, keyboard, parseMode = 'Markdown') {
        // Пытаемся удалить текущее сообщение (игнорируем ошибки)
        await ctx.deleteMessage().catch(err => {
            // Ожидаемые ошибки: сообщение слишком старое (>48ч), нет прав, уже удалено
            if (err?.error_code !== 400) {
                console.log('⚠️ Could not delete message:', err?.description || err?.message);
            }
        });

        // Отправляем новое сообщение
        await ctx.reply(text, {
            reply_markup: keyboard,
            parse_mode: parseMode
        });
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

            if (isMediaError) {
                // Не можем редактировать текст в медиа → удаляем и шлём новое
                try {
                    await ctx.deleteMessage();
                } catch (delErr) {
                    console.log('⚠️ Could not delete message:', delErr?.message);
                }
                await ctx.reply(text, {
                    reply_markup: keyboard,
                    parse_mode: parseMode
                });
            } else {
                console.error('❌ Unexpected edit error:', errMsg);
                throw err;
            }
        }
    }
}

module.exports = LessonTaskController;