const ModuleService = require("../Services/ModuleService");
const KeyboardFactory = require("../Services/KeyboardFactory");
const logger = require('../Logger/Logger');
const {InlineKeyboard} = require("grammy");

const moduleService = new ModuleService();

class ModuleController {
    /**
     * Обработка callback queries для курсов и модулей
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;

            if (callbackData.startsWith('back_to_modules:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await ModuleController.backToModules(ctx, moduleId);
            } else if (callbackData.startsWith('view_course:')) {
                const courseId = parseInt(callbackData.split(':')[1]);
                const page = parseInt(callbackData.split(':')[2]);
                await ModuleController.showModules(ctx, courseId, page);
            }
        } catch (error) {
            logger.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Показать модули курса
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} courseId - ID курса
     * @param page - страница модулей
     */
    static async showModules(ctx, courseId, page = 1) {
        try {
            const itemsPerPage = 4;
            const offset = (page - 1) * itemsPerPage;

            const { rows: modules, count: totalModules } = await moduleService.getModulesByCourseId(courseId, {
                limit: itemsPerPage,
                offset: offset
            });


            if (totalModules === 0) {
                const keyboard = new InlineKeyboard().text('🔙 К курсам', `back_to_courses`);
                await ctx.editMessageText('В данном курсе модули отсутствуют.', { reply_markup: keyboard });
                return;
            }
            const message = 'Модули курса:';

            const keyboard = KeyboardFactory.createModulesKeyboard(
                modules,
                courseId,
                page,
                totalModules,
                itemsPerPage
            );

            await ctx.editMessageText(message, { reply_markup: keyboard });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка в showModules:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке модулей');
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

            await ModuleController.showModules(ctx, module.courseId);
        } catch (error) {
            logger.error('Ошибка в backToModules:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к модулям');
        }
    }
}

module.exports = ModuleController;