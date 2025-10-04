const BaseRepositoryInterface = require('./baseRepositoryInterface');

/**
 * Интерфейс для репозитория уроков
 */
class LessonRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Получить уроки по ID модуля
     * @param {number} moduleId - ID модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByModuleId(moduleId, options = {}) {
        throw new Error('Method findByModuleId must be implemented');
    }

    /**
     * Получить урок с информацией о модуле
     * @param {number} lessonId - ID урока
     * @returns {Promise<Object|null>}
     */
    async findByIdWithModule(lessonId) {
        throw new Error('Method findByIdWithModule must be implemented');
    }

    /**
     * Получить все уроки с информацией о модулях и курсах
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAllWithModulesAndCourses(options = {}) {
        throw new Error('Method findAllWithModulesAndCourses must be implemented');
    }

    /**
     * Получить уроки по названию (поиск)
     * @param {string} title - Название урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByTitle(title, options = {}) {
        throw new Error('Method findByTitle must be implemented');
    }

    /**
     * Получить уроки по содержимому (поиск)
     * @param {string} content - Содержимое урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByContent(content, options = {}) {
        throw new Error('Method findByContent must be implemented');
    }

    /**
     * Получить количество уроков в модуле
     * @param {number} moduleId - ID модуля
     * @returns {Promise<number>}
     */
    async countByModuleId(moduleId) {
        throw new Error('Method countByModuleId must be implemented');
    }

    /**
     * Получить уроки с пагинацией
     * @param {number} moduleId - ID модуля
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>}
     */
    async findPaginatedByModuleId(moduleId, page = 1, limit = 10) {
        throw new Error('Method findPaginatedByModuleId must be implemented');
    }

    /**
     * Получить уроки по курсу (через модули)
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCourseId(courseId, options = {}) {
        throw new Error('Method findByCourseId must be implemented');
    }
}

module.exports = LessonRepositoryInterface;

