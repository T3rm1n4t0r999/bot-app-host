const KeyboardFactory = require("../services/KeyboardFactory");
const LessonService = require("../services/LessonService");
const logger = require("../logger/Logger");
const LessonController = require("./LessonController");
const StudentService = require("../services/StudentService");
const {InlineKeyboard} = require("grammy");
const lessonService = new LessonService();
const studentService = new StudentService();

class LessonTaskController {
    /**
     * Обработка команд
     * @param ctx
     * @returns {Promise<void>}
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_task:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.showLessonTask(ctx, lessonId);
            } else if(callbackData.startsWith('back_to_task:')) {
                const taskId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.backToTask(ctx, taskId);
            }else if(callbackData.startsWith('back_to_lesson:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.backToLesson(ctx, lessonId);
            }else if(callbackData.startsWith('view_tasks:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.showLessonTasks(ctx, lessonId);
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
            const lessonTask = await lessonService.getLessonTask(taskId);
            if(!lessonTask) {
                await ctx.answerCallbackQuery();
                return
            }
            await LessonTaskController.showLessonTask(ctx, lessonTask.id);
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
     * Показать материалы курса
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param lessonId - ID урока
     */
    static async showLessonTasks(ctx, lessonId) {
        try {
            const tasks = await lessonService.getLessonTasksByLessonId(lessonId);
            const keyboard = new InlineKeyboard();
            if (!tasks || tasks.length === 0) {
                await ctx.answerCallbackQuery('В этом уроке пока нет заданий.');
                return;
            }

            let message = `Практические задания урока:`;

            tasks.forEach((task, index) => {
                keyboard.text(task.title, `view_task:${task.id}`).row();
            });
            keyboard.text('🔙 К уроку', `view_lesson:${lessonId}`).row();
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

    static async updateMessage(ctx, text, keyboard) {
        const currentMsg = ctx.callbackQuery?.message;
        const isCurrentPhoto = !!currentMsg?.photo;

        if (isCurrentPhoto) {
            try {
                await ctx.deleteMessage();
                await ctx.reply(text, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
                return await ctx.answerCallbackQuery();
            } catch (e) {

            }
        }

        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    /**
     * Показать задание
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param taskId - ID урока
     */
    static async showLessonTask(ctx, taskId) {
        try {
            const task = await lessonService.getLessonTask(taskId);
            if (!task) {
                await ctx.answerCallbackQuery("Задание не найдено");
                return;
            }
            const student =  ctx?.state?.student;
            const lastBestAttempt = await studentService.findLastBestResult(student?.id,'lesson_task', taskId);
            const lessonId = task.lessonId;
            let message = '';
            if (lastBestAttempt){
                const taskAttemptMessage = task.maxAttempts < 1 ? lastBestAttempt.attempt : `${lastBestAttempt.attempt} / ${task.maxAttempts}`;
                message = 'Практическое задание:\n\n'+
                    `📖 *Название*: ${task.title}\n`+
                    `🏆 *Баллы*: ${lastBestAttempt.points} / ${task.maxScore}\n`+
                    `*Попыток*: ${taskAttemptMessage}`;
            }else{
                message = 'Практическое задание:\n\n'+
                    `📖 *Название*: ${task.title}\n`+
                    `🏆 *Максимально баллов*: ${task.maxScore}\n`+
                    `*Максимально попыток*: ${task.maxAttempts < 1 ? 'Не ограничено' : task.maxAttempts}`;
            }
            const blocked = task.maxAttempts === lastBestAttempt?.attempt;
            const keyboard = KeyboardFactory.createLessonTaskKeyboard(task.id, lessonId, 'lesson_task', blocked);

            await this.updateMessage(ctx, message, keyboard);
            await ctx.answerCallbackQuery();
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }
}

module.exports = LessonTaskController;