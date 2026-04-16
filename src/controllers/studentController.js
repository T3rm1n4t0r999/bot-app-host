const StudentService = require('../services/studentService');
const errorHandler = require("../utils/errorHandler");
const keyboardFactory = require("../services/keyboardFactory");
const logger = require('../logger/logger');
// Создаем экземпляр сервиса
const studentService = new StudentService();

class studentController {
    /**
     * Получение информации о студенте
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async showStudentInfo(ctx) {
        try {
            const student = ctx.state.student;
            const keyboard = keyboardFactory.createProfileKeyboard();

            const message =
                `📌 Ваш профиль:\n\n`+
                `👤 Имя: ${student.firstname}\n`+
                `🏆 Ранг: ${student.rank}\n`+
                `⭐ Баллы: ${student.score}\n`+
                `🎓 Статус: ${student.role}\n`;


            if(ctx.callbackQuery){
                ctx.editMessageText(message, {reply_markup:keyboard});
                ctx.answerCallbackQuery()
            }
            else await ctx.reply(message, { reply_markup: keyboard });

        } catch (error) {
            logger.error('Error in StudentController.showStudentInfo:', error);
            await errorHandler(ctx, error);
        }
    }

    /**
     * Показать таблицу лидеров
     * @param ctx
     * @returns {Promise<void>}
     */
    static async showLeaderboard(ctx) {
        const student = ctx.state.student;
        const limit = 10;
        const leaderboard = await studentService.getLeaderboard(limit)
        if (!leaderboard) {
            await ctx.answerCallbackQuery("Топ студентов пуст!");
            return
        }
        const keyboard = keyboardFactory.createLeaderboardKeyboard(leaderboard, student);
        const message = 'Топ студентов';
        await ctx.editMessageText(message, { reply_markup: keyboard });
        await ctx.answerCallbackQuery();
    }

    /**
     * Обработка команды /start
     * @param ctx
     * @returns {Promise<void>}
     */
    static async handleStart(ctx) {
        try {
            const student = await studentService.registerStudent(ctx.from);
            const keyboard = keyboardFactory.createMainMenuKeyboard();

            await ctx.reply(
                '✅ Добро пожаловать! Выберите действие:',
                { reply_markup: keyboard }
            );
        } catch (error) {
            logger.error('Error in StudentController.handleStart', error);
            await errorHandler(ctx, error);
        }
    }
}

module.exports = studentController;