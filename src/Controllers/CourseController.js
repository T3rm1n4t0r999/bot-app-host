const CourseService = require("../Services/CourseService");
const KeyboardFactory = require("../Services/KeyboardFactory");

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
            const itemsPerPage = 4;
            const offset = (page - 1) * itemsPerPage;

            // Получаем сразу порезанные курсы и их общее количество
            const { rows: courses, count: totalCourses } = await courseService.getAccessibleCourses(userData, {
                limit: itemsPerPage,
                offset: offset
            });

            // Проверяем ОБЩЕЕ количество курсов в БД, а не длину текущего массива
            if (totalCourses === 0) {
                if(ctx.callbackQuery) {
                    await ctx.answerCallbackQuery('У вас нет доступных курсов.');
                    return;
                }
                return ctx.reply('У вас нет доступных курсов.');
            }

            const message = 'Ваши курсы:';

            // Передаем totalCourses для правильного расчета страниц
            const keyboard = KeyboardFactory.createCoursesKeyboard(courses, page, totalCourses, itemsPerPage);

            if(ctx.callbackQuery) {
                await ctx.editMessageText(message, {reply_markup: keyboard});
                await ctx.answerCallbackQuery();
            } else {
                await ctx.reply(message, { reply_markup: keyboard });
            }
        } catch (error) {
            console.error('Ошибка в showCourses:', error);
            if (ctx.callbackQuery) {
                await ctx.answerCallbackQuery('❌ Ошибка при загрузке курсов');
            } else {
                await ctx.reply('❌ Произошла ошибка при загрузке курсов.');
            }
        }
    }
}

module.exports = CourseController;