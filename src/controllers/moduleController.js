const ModuleService = require("../services/moduleService");
const KeyboardFactory = require("../services/keyboardFactory");
const CourseController = require("./courseController");
const LessonService = require("../services/lessonService");
// Создаем экземпляр сервиса
const moduleService = new ModuleService();
const lessonService = new LessonService();

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

    /**
     * Показать уроки модуля
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} moduleId - ID модуля
     */
    static async showModuleLessons(ctx, moduleId) {
        try {
            const lessons = await lessonService.getLessonsByModuleId(moduleId);

            if (lessons.length === 0) {
                await ctx.editMessageText('📚 В данном модуле уроки отсутствуют.');
                return;
            }

            const message = '📚 Уроки модуля:';
            const keyboard = KeyboardFactory.createLessonsKeyboard(lessons, moduleId);

            await ctx.editMessageText(message, { reply_markup: keyboard });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка в showModuleLessons:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке уроков');
        }
    }

    /**
     * Вернуться к модулям курса
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} moduleId - ID модуля
     */
    static async backToModules(ctx, moduleId) {
        try {
            const module = await moduleService.getModuleById(moduleId);

            if (!module) {
                await ctx.answerCallbackQuery('❌ Модуль не найден');
                return;
            }

            await CourseController.showCourseModules(ctx, module.courseId);
        } catch (error) {
            console.error('Ошибка в backToModules:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к модулям');
        }
    }

    /**
     * Обработка callback queries для курсов и модулей
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;

            if (callbackData.startsWith('view_module:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await ModuleController.showModuleLessons(ctx, moduleId);
            } else if (callbackData.startsWith('back_to_modules:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await ModuleController.backToModules(ctx, moduleId);
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }
}

module.exports = ModuleController;