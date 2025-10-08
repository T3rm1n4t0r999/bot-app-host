const StudentService = require('../services/studentService');
const errorHandler = require("../utils/errorHandler");
const keyboardFactory = require("../services/keyboardFactory");

// Создаем экземпляр сервиса
const studentService = new StudentService();

class studentController {/**
 * Получение информации о студенте
 * @param {import('grammy').Context} ctx - Контекст бота
 */
static async getStudentInfo(ctx) {
    try {
        const student = ctx.state.student;

        const keyboard = keyboardFactory.createMainMenuKeyboard();

        const formattedDate = student.registered_at.toLocaleDateString('ru-RU');

        const message =
            `📌 Ваш профиль:\n\n`+
            `👤 Имя: ${student.firstname}\n`+
            `📛 Фамилия: ${student.lastname || 'не указана'}\n`+
            `🔗 Юзернейм: @${student.username || 'не указан'}\n`+
            `📅 Дата регистрации: ${formattedDate}\n`+
            `🏆 Ранг: ${student.rank}\n`+
            `⭐ Баллы: ${student.score}\n`+
            `🎓 Статус: ${student.role}\n`;

        await ctx.reply(message, { reply_markup: keyboard });

    } catch (error) {
        console.error('Ошибка в StudentController.getStudentInfo:', error);
        await errorHandler(ctx, error);
    }
}


    static async handleStart(ctx) {
        try {
            const student = await studentService.registerStudent(ctx.from);

            const keyboard = keyboardFactory.createMainMenuKeyboard();

            await ctx.reply(
                '✅ Добро пожаловать! Выберите действие:',
                { reply_markup: keyboard }
            );
        } catch (error) {
            console.error('Ошибка в StudentController.handleStart:', error);
            await errorHandler(ctx, error);
        }
    }
}

module.exports = studentController;