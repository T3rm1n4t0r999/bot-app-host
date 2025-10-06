const CourseService = require("../services/courseService");
const ModuleService = require("../services/moduleService");
const KeyboardFactory = require("../services/keyboardFactory");
const StudentController = require("./studentController");

// Создаем экземпляры сервисов
const courseService = new CourseService();
const moduleService = new ModuleService();

class CourseController {
    /**
     * Обработка команды /course
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async getCourses(ctx) {
        try {
            const userData = ctx.state.student;
            const courses = await courseService.getAccessibleCourses(userData);

            if (courses.length === 0) {
                return ctx.reply('📚 На данный момент курсы отсутствуют.');
            }

            const message = '📚 Выберите курс:';
            const keyboard = KeyboardFactory.createCoursesKeyboard(courses);

            await ctx.reply(message, { reply_markup: keyboard });
        } catch (error) {
            console.error('Ошибка в courseController:', error);
            await ctx.reply('❌ Произошла ошибка при загрузке курсов.');
        }
    }

    /**
     * Показать курсы (для редактирования сообщения)
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} page - Номер страницы (по умолчанию 1)
     */
    static async showCourses(ctx, page = 1) {
        try {
            const userData = ctx.state.student;
            const courses = await courseService.getAccessibleCourses(userData);

            if (courses.length === 0) {
                await ctx.editMessageText('📚 На данный момент курсы отсутствуют.');
                return;
            }

            const message = '📚 Выберите курс:';
            const keyboard = KeyboardFactory.createCoursesKeyboard(courses, page);

            await ctx.editMessageText(message, { reply_markup: keyboard });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка в showCourses:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка при загрузке курсов.');
        }
    }

    /**
     * Обработка callback queries для курсов и модулей
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;

            if (callbackData.startsWith('view_course:')) {
                const courseId = parseInt(callbackData.split(':')[1]);
                await CourseController.showCourseModules(ctx, courseId);
            } else if (callbackData.startsWith('courses_page:')) {
                const page = parseInt(callbackData.split(':')[1]);
                await CourseController.showCourses(ctx, page);
            } else if (callbackData === 'back_to_courses') {
                await CourseController.showCourses(ctx, 1);
            } else if (callbackData === 'back_to_profile') {
                await CourseController.showStudentProfile(ctx);
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Показать модули курса
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} courseId - ID курса
     */
    static async showCourseModules(ctx, courseId) {
        try {
            const modules = await moduleService.getModulesByCourseId(courseId);

            if (modules.length === 0) {
                await ctx.editMessageText('📚 В данном курсе модули отсутствуют.');
                return;
            }

            const message = '📚 Модули курса:';
            const keyboard = KeyboardFactory.createModulesKeyboard(modules, courseId);

            await ctx.editMessageText(message, { reply_markup: keyboard });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка в showCourseModules:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке модулей');
        }
    }

    /**
     * Показать профиль студента
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async showStudentProfile(ctx) {
        try {
            // Используем метод из StudentController для показа профиля
            await StudentController.getStudentInfo(ctx);
        } catch (error) {
            console.error('Ошибка в showStudentProfile:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке профиля');
        }
    }
}

module.exports = CourseController;