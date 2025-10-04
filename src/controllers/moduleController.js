const ModuleService = require("../services/moduleService");
const KeyboardFactory = require("../services/keyboardFactory");

// Создаем экземпляр сервиса
const moduleService = new ModuleService();

class ModuleController {
    /**
     * Получить все модули (для отладки или админки)
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async getModules(ctx) {
        try {
            const modules = await moduleService.getAllModulesWithCourses();

            if (modules.length === 0) {
                return ctx.reply('📚 На данный момент модули отсутствуют.');
            }

            let message = '📚 Все модули:\n\n';

            modules.forEach((module, index) => {
                message += `${index + 1}: ${module.title} (Курс: ${module.course?.title || 'Неизвестно'})\n`;
            });

            await ctx.reply(message);
        } catch (error) {
            console.error('Ошибка в ModuleController:', error);
            await ctx.reply('❌ Произошла ошибка при загрузке модулей.');
        }
    }

    /**
     * Получить модули по ID курса
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} courseId - ID курса
     */
    static async getModulesByCourse(ctx, courseId) {
        try {
            const modules = await moduleService.getModulesByCourseId(courseId);

            if (modules.length === 0) {
                return ctx.reply('📚 В данном курсе модули отсутствуют.');
            }

            const message = '📚 Модули курса:';
            const keyboard = KeyboardFactory.createModulesKeyboard(modules, courseId);

            await ctx.reply(message, { reply_markup: keyboard });
        } catch (error) {
            console.error('Ошибка в getModulesByCourse:', error);
            await ctx.reply('❌ Произошла ошибка при загрузке модулей.');
        }
    }
}

module.exports = ModuleController;