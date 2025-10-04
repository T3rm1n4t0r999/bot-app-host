const CourseService = require("../services/courseService");
const ModuleService = require("../services/moduleService");
const LessonService = require("../services/lessonService");
const KeyboardFactory = require("../services/keyboardFactory");
const StudentController = require("./studentController");

// Создаем экземпляры сервисов
const courseService = new CourseService();
const moduleService = new ModuleService();
const lessonService = new LessonService();

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
            } else if (callbackData === 'back_to_main') {
                await CourseController.showCourses(ctx, 1);
            } else if (callbackData === 'back_to_profile') {
                await CourseController.showStudentProfile(ctx);
            } else if (callbackData === 'page_info') {
                // Просто отвечаем на callback query без изменений
                await ctx.answerCallbackQuery();
            } else if (callbackData.startsWith('view_module:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await CourseController.showModuleLessons(ctx, moduleId);
            } else if (callbackData.startsWith('view_lesson:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await CourseController.showLessonDetails(ctx, lessonId);
            } else if (callbackData.startsWith('back_to_modules:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await CourseController.backToModules(ctx, moduleId);
            } else if (callbackData.startsWith('back_to_lessons:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await CourseController.backToLessons(ctx, moduleId);
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
            if (lesson.content) {
                message += `${lesson.content}\n\n`;
            }

            const keyboard = KeyboardFactory.createLessonNavigationKeyboard(lesson.moduleId);

            await ctx.editMessageText(message, { 
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка в showLessonDetails:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке урока');
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
     * Вернуться к урокам модуля
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} moduleId - ID модуля
     */
    static async backToLessons(ctx, moduleId) {
        try {
            await CourseController.showModuleLessons(ctx, moduleId);
        } catch (error) {
            console.error('Ошибка в backToLessons:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к урокам');
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