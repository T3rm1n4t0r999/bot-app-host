const CourseRepository = require("../repository/courseRepository");

class CourseService {
    constructor() {
        this.courseRepository = new CourseRepository();
    }

    /**
     * Получить все курсы
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async getAllCourses(options = {}) {
        try {
            return await this.courseRepository.findAll(options);
        } catch (error) {
            console.error('Error getting all courses:', error);
            throw error;
        }
    }

    /**
     * Получить доступные курсы для пользователя
     * @param {Object} userData - Данные пользователя
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(userData) {
        try {
            //Все имеют доступ
            return await this.getAllCourses();
        } catch (error) {
            console.error('Error getting accessible courses:', error);
            throw error;
        }
    }

}

module.exports = CourseService;