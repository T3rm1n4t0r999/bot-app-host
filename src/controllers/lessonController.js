const KeyboardFactory = require("../services/keyboardFactory");
const LessonService = require("../services/lessonService");
const ModuleController = require("../controllers/moduleController");
const logger = require("../logger/logger");
const {InlineKeyboard} = require("grammy");

const lessonService = new LessonService();

class LessonController {
    /**
     * Обработка callback queries для курсов и модулей
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_lesson:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonDetails(ctx, lessonId);
            } else if (callbackData.startsWith('view_module:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessons(ctx, moduleId);
            }else if (callbackData.startsWith('back_to_lessons:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await LessonController.backToLessons(ctx, moduleId);
            }
        } catch (error) {
            logger.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Показать уроки модуля
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} moduleId - ID модуля
     */
    static async showLessons(ctx, moduleId) {
        try {
            const lessons = await lessonService.getLessonsByModuleId(moduleId);

            if (lessons.length === 0) {
                const keyboard = new InlineKeyboard().text('🔙 К модулям', `back_to_modules:${moduleId}`);
                await ctx.editMessageText('📚 В данном модуле уроки отсутствуют.', {reply_markup: keyboard});
                return;
            }

            const message = '📚 Уроки модуля:';
            const keyboard = KeyboardFactory.createLessonsKeyboard(lessons, moduleId);

            await ctx.editMessageText(message, { reply_markup: keyboard });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logger.error('Ошибка в showModuleLessons:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке уроков');
        }
    }

    /**
     * Показать детали урока
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} lessonId - ID урока
     */
    static async showLessonDetails(ctx, lessonId) {
        try {
            const lesson = await lessonService.getLessonById(lessonId);

            if (!lesson) {
                await ctx.answerCallbackQuery('❌ Урок не найден');
                return;
            }

            let message = `📚 **${lesson.title}**\n\n`;
            if (lesson.description) {
                message += `${lesson.description}`;
            }

            const keyboard = KeyboardFactory.createLessonNavigationKeyboard(lesson.moduleId, lesson.id);

            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logger.error('Ошибка в showLessonDetails:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке урока');
        }
    }

    /**
     * Вернуться к урокам модуля
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} moduleId - ID модуля
     */
    static async backToLessons(ctx, moduleId) {
        try {
            const lessons = await lessonService.getLessonsByModuleId(moduleId);
            if(lessons.length === 0) {
                await ctx.answerCallbackQuery('❌ Уроки не найдены');
            }

            await LessonController.showLessons(ctx, moduleId);
        } catch (error) {
            logger.error('Ошибка в backToLessons:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к урокам');
        }
    }
}

module.exports = LessonController;