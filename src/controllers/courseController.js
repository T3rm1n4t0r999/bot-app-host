const CourseService = require("../services/courseService");
const ModuleService = require("../services/moduleService");
const KeyboardFactory = require("../services/keyboardFactory");
const StudentController = require("./studentController");

// Создаем экземпляры сервисов
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
                    await ctx.answerCallbackQuery('📚 На данный момент курсы отсутствуют.');
                    return
                }
                return ctx.reply('📚 На данный момент курсы отсутствуют.');
            }

            const message = '📚 Выберите курс:';
            const keyboard = KeyboardFactory.createCoursesKeyboard(courses, page);
            if(ctx.callbackQuery) {
                await ctx.editMessageText(message, {reply_markup: keyboard});
                await ctx.answerCallbackQuery();
            }
            else await ctx.reply(message, { reply_markup: keyboard });
        } catch (error) {
            console.error('Ошибка в showCourses:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка при загрузке курсов.');
        }
    }


}

module.exports = CourseController;