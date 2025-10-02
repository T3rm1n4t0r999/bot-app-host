const CourseService = require("../services/courseService");
const KeyboardFactory = require("../services/keyboardFactory");

class CourseController {
    /**
     * Обработка команды /course
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async getCourses(ctx) {
        try {
            const userData = ctx.state.student;
            const courses = await CourseService.getAccessibleCourses(userData);

            if (courses.length === 0) {
                return ctx.reply('📚 На данный момент курсы отсутствуют.');
            }

            let message = '📚Доступные курсы:\n\n';

            courses.forEach((course, index) => {
                message += `${index+1}: ${course.title}\n`
            })

            ctx.reply(message);
        } catch (error) {
            console.error('Ошибка в courseController:', error);
        }
    }
}

module.exports = CourseController;