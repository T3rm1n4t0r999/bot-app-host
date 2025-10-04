const BaseRepositoryInterface = require('./baseRepositoryInterface');

/**
 * Интерфейс для репозитория курсов
 */
class CourseRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Получить доступные курсы для студента
     * @param {Object} userData - Данные пользователя
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(userData) {
        throw new Error('Method getAccessibleCourses must be implemented');
    }

    /**
     * Получить курс с модулями
     * @param {number} courseId - ID курса
     * @returns {Promise<Object|null>}
     */
    async findByIdWithModules(courseId) {
        throw new Error('Method findByIdWithModules must be implemented');
    }

    /**
     * Получить курс со студентами
     * @param {number} courseId - ID курса
     * @returns {Promise<Object|null>}
     */
    async findByIdWithStudents(courseId) {
        throw new Error('Method findByIdWithStudents must be implemented');
    }

    /**
     * Получить курсы по названию (поиск)
     * @param {string} title - Название курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByTitle(title, options = {}) {
        throw new Error('Method findByTitle must be implemented');
    }

    /**
     * Получить курсы с пагинацией
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @param {Object} where - Условия поиска
     * @returns {Promise<Object>}
     */
    async findPaginated(page = 1, limit = 10, where = {}) {
        throw new Error('Method findPaginated must be implemented');
    }

    /**
     * Получить количество студентов на курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async getStudentCount(courseId) {
        throw new Error('Method getStudentCount must be implemented');
    }

    /**
     * Получить количество модулей в курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async getModuleCount(courseId) {
        throw new Error('Method getModuleCount must be implemented');
    }
}

module.exports = CourseRepositoryInterface;

