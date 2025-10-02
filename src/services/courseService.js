const CourseRepository = require("../repository/CourseRepository");

class courseService {
    static async getAllCourses(){
        return await CourseRepository.getAllCourses();
    }

    // Получить все доступные курсы для роли
    static async getAccessibleCourses(userData) {
        try {
            if (userData.role === 'premium') {
                return await this.getAllCourses();
            }

            if (userData.role === 'student') {
                return await CourseRepository.getAccessibleCourses(userData);
            }

        } catch (error) {
            console.error('Error getting accessible courses:', error);
            return [];
        }
    }
}
module.exports = courseService;