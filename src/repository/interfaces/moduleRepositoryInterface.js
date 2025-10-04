const BaseRepositoryInterface = require('./baseRepositoryInterface');

/**
 * Интерфейс для репозитория модулей
 */
class ModuleRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Получить модули по ID курса
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCourseId(courseId, options = {}) {
        throw new Error('Method findByCourseId must be implemented');
    }

    /**
     * Получить модуль с информацией о курсе
     * @param {number} moduleId - ID модуля
     * @returns {Promise<Object|null>}
     */
    async findByIdWithCourse(moduleId) {
        throw new Error('Method findByIdWithCourse must be implemented');
    }

    /**
     * Получить все модули с информацией о курсах
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAllWithCourses(options = {}) {
        throw new Error('Method findAllWithCourses must be implemented');
    }

    /**
     * Получить модуль с уроками
     * @param {number} moduleId - ID модуля
     * @returns {Promise<Object|null>}
     */
    async findByIdWithLessons(moduleId) {
        throw new Error('Method findByIdWithLessons must be implemented');
    }

    /**
     * Получить модули по названию (поиск)
     * @param {string} title - Название модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByTitle(title, options = {}) {
        throw new Error('Method findByTitle must be implemented');
    }

    /**
     * Получить количество модулей в курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async countByCourseId(courseId) {
        throw new Error('Method countByCourseId must be implemented');
    }

    /**
     * Получить модули с пагинацией
     * @param {number} courseId - ID курса
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>}
     */
    async findPaginatedByCourseId(courseId, page = 1, limit = 10) {
        throw new Error('Method findPaginatedByCourseId must be implemented');
    }
}

module.exports = ModuleRepositoryInterface;

