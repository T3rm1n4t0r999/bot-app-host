const CourseRepository = require("../repository/CourseRepository");

class CourseService {
    constructor() {
        this.courseRepository = new CourseRepository();
    }

    /**
     * Получить доступные курсы для пользователя
     * @param {Object} userData - Данные пользователя
     * @param options
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(userData, options = {}) {
        try {
            return await this.courseRepository.getStudentCourses(userData, options);
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