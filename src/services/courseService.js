const CourseRepository = require("../repository/courseRepository");

class CourseService {
    constructor() {
        this.courseRepository = new CourseRepository();
    }

    /**
     * Получить доступные курсы для пользователя
     * @param {Object} userData - Данные пользователя
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(userData) {
        try {
            //Все имеют доступ
            return await this.courseRepository.getStudentCourses(userData);
        } catch (error) {
            console.error('Error getting accessible courses:', error);
            throw error;
        }
    }

    async getAutoAssignedCourses(userData) {
        try {
            return await this.courseRepository.getAutoAssignedCourses(userData);
        } catch (e) {
            console.error('Error getting auto assigned courses:', e);
            throw e;
        }
    }

    async assignCourses(student, courses) {
        try {
            return await this.courseRepository.assignCourses(student, courses);
        } catch (e) {
            console.error('Error getting courses:', e);
            throw e;
        }
    }

    async getGroupAssignedCourses(groupId) {
        return await this.courseRepository.getGroupAssignedCourses(groupId);
    }
}

module.exports = CourseService;