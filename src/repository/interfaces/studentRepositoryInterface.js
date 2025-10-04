const BaseRepositoryInterface = require('./baseRepositoryInterface');

/**
 * Интерфейс для репозитория студентов
 */
class StudentRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Найти студента по Telegram ID
     * @param {string} telegramId - Telegram ID студента
     * @returns {Promise<Object|null>}
     */
    async findByTelegramId(telegramId) {
        throw new Error('Method findByTelegramId must be implemented');
    }

    /**
     * Найти студента по email
     * @param {string} email - Email студента
     * @returns {Promise<Object|null>}
     */
    async findByEmail(email) {
        throw new Error('Method findByEmail must be implemented');
    }

    /**
     * Получить студентов с их курсами
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAllWithCourses(options = {}) {
        throw new Error('Method findAllWithCourses must be implemented');
    }

    /**
     * Получить доступные курсы студента
     * @param {number} studentId - ID студента
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(studentId) {
        throw new Error('Method getAccessibleCourses must be implemented');
    }

    /**
     * Добавить курс студенту
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<Object>}
     */
    async addCourse(studentId, courseId) {
        throw new Error('Method addCourse must be implemented');
    }

    /**
     * Удалить курс у студента
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<boolean>}
     */
    async removeCourse(studentId, courseId) {
        throw new Error('Method removeCourse must be implemented');
    }

    /**
     * Проверить доступ студента к курсу
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<boolean>}
     */
    async hasAccessToCourse(studentId, courseId) {
        throw new Error('Method hasAccessToCourse must be implemented');
    }

    /**
     * Получить студентов по роли
     * @param {string} role - Роль студента
     * @returns {Promise<Array>}
     */
    async findByRole(role) {
        throw new Error('Method findByRole must be implemented');
    }
}

module.exports = StudentRepositoryInterface;

