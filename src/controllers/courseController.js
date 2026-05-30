const CourseService = require("../services/courseService");
const KeyboardFactory = require("../services/keyboardFactory");

const courseService = new CourseService();

class CourseController {
    /**
     * Обработка callback queries для курсов
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;

            if (callbackData.startsWith('courses_page:')) {
                const page = parseInt(callbackData.split(':')[1]);
                await CourseController.showCourses(ctx, page);
            } else if (callbackData === 'back_to_courses') {
                await CourseController.showCourses(ctx, 1);
            } else if (callbackData === 'page_info') {
                await ctx.answerCallbackQuery('Это номер страницы');
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Показать курсы
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param page - страница курсов
     */
    static async showCourses(ctx, page = 1) {
        try {
            const userData = ctx.state.student;
            const courses = await courseService.getAccessibleCourses(userData);

            if (courses.length === 0) {
                if(ctx.callbackQuery) {
                    await ctx.answerCallbackQuery('У вас нет доступных курсов.');
                    return
                }
                return ctx.reply('У вас нет доступных курсов.');
            }

            const message = 'Ваши курсы:';
            const keyboard = KeyboardFactory.createCoursesKeyboard(courses, page);
            if(ctx.callbackQuery) {
                await ctx.editMessageText(message, {reply_markup: keyboard});
                await ctx.answerCallbackQuery();
            }
            else await ctx.reply(message, { reply_markup: keyboard });
        } catch (error) {
            console.error('Ошибка в showCourses:', error);
            // ИСПРАВЛЕНО: Безопасный ответ об ошибке
            if (ctx.callbackQuery) {
                await ctx.answerCallbackQuery('❌ Ошибка при загрузке курсов');
            } else {
                await ctx.reply('❌ Произошла ошибка при загрузке курсов.');
            }
        }
    }
}

module.exports = CourseController;