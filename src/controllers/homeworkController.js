const HomeworkService = require("../services/homeworkService");
const KeyboardFactory = require("../services/keyboardFactory");
const logger = require("../logger/logger");
const homeworkService = new HomeworkService();
const RedisService = require("../services/redisService");

const entityType = RedisService.ENTITY_TYPES.Homework;

class HomeworkController {

    /**
     * Обработка callback queries для домашних заданий
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;

            if (callbackData.startsWith('homework_page:')) {
                const page = parseInt(callbackData.split(':')[1]);
                await HomeworkController.showHomeworks(ctx, page);
            } else if (callbackData === 'back_to_homework') {
                await HomeworkController.showHomeworks(ctx, 1);
            }else if (callbackData.startsWith('view_homework:')) {
                const homeworkId = parseInt(callbackData.split(':')[1]);
                await HomeworkController.showHomeworkTask(ctx, homeworkId);
            }else if (callbackData === 'page_info') {
                await ctx.answerCallbackQuery('Это номер страницы');
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Показать все доступные домашние задания
     */
    static async showHomeworks(ctx, page = 1) {
        try {
            const studentId = ctx.state?.student?.id;
            const homeworks = await homeworkService.getStudentHomeworks(studentId);
            if(!homeworks || homeworks.length === 0){
                if(ctx.callbackQuery){
                    await ctx.answerCallbackQuery('У вас пока нет домашних заданий.\\nРешите урок, чтобы получить домашнее задание.')
                    return;
                }
                return ctx.reply('У вас пока нет домашних заданий.\nРешите урок, чтобы получить домашнее задание.')
            }
            const message = 'Выберите домашнее задание:';
            const keyboard = KeyboardFactory.createHomeworksKeyboard(homeworks, page);
            if(ctx.callbackQuery){
                await ctx.editMessageText(message, {reply_markup:keyboard});
                await ctx.answerCallbackQuery();
            }
            else await ctx.reply(message, {reply_markup:keyboard});
        }catch (error) {
            logger.error('Error while getting homeworks', error);
        }
    }

    /**
     * Показать задание домашней работы
     */
    static async showHomeworkTask(ctx, homeworkId){
        try {
            const homework = await homeworkService.getHomework(homeworkId);
            if (!homework || homework.length === 0) {
                await ctx.answerCallbackQuery('Домашнее задание отсутсвует');
                return;
            }
            const message = 'Домашнее задание:\n\n'+
                `📖 *Название*: ${homework.title}\n`+
                `🏆 *Максимально баллов*: ${homework.maxScore}\n`;

            const keyboard = KeyboardFactory.createHomeworkTaskKeyboard(homeworkId, 'homework');
            await ctx.editMessageText(message, {
                reply_markup:keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (e) {
            logger.error('Error while showing homework ', e);
            throw e;
        }
    }

    /**
     * Вернуться к домашним работам
     */
    static async backToHomework(ctx, homeworkId) {
        await HomeworkController.showHomeworks(ctx, homeworkId);
    }
}

module.exports = HomeworkController;