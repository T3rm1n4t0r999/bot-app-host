const RedisService = require("../services/redisService");
const KeyboardFactory = require("../services/keyboardFactory");
const LessonService = require("../services/lessonService");
const TaskService = require("../services/taskService");

const lessonService = new LessonService();
const lessonTaskService = new TaskService();
const taskService = new TaskService();
const entityType = RedisService.ENTITY_TYPES.TASK

class LessonTaskController {
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_lesson_task:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonTaskController.showLessonTask(ctx, lessonId);
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

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
            logger.error("Error while forwarding back to task",e);
        }
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
                await ctx.reply('📚 В этом уроке пока нет заданий.');
                return;
            }
            ctx.lessonId = lessonId;
            const task = tasks[0]
            const keyboard = KeyboardFactory.createLessonTaskKeyboard(lessonId, task.id, 'lesson_task');
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
}

module.exports = LessonTaskController;