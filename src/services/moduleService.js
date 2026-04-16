const ModuleRepository = require('../repository/moduleRepository');

class ModuleService {
    constructor() {
        this.moduleRepository = new ModuleRepository();
    }

    /**
     * Получить все модули для конкретного курса
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив модулей
     */
    async getModulesByCourseId(courseId, options = {}) {
        try {
            return await this.moduleRepository.findByCourseId(courseId, options);
        } catch (error) {
            console.error('Error getting modules by course ID:', error);
            throw error;
        }
    }

    /**
     * Получить модуль по ID
     * @param {number} moduleId - ID модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Object|null>} - Модуль или null
     */
    async getModuleById(moduleId, options = {}) {
        try {
            return await this.moduleRepository.findById(moduleId, options);
        } catch (error) {
            console.error('Error getting module by ID:', error);
            throw error;
        }
    }
}

module.exports = ModuleService;
