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

    /**
     * Получить модуль с информацией о курсе
     * @param {number} moduleId - ID модуля
     * @returns {Promise<Object|null>} - Модуль с курсом или null
     */
    async getModuleWithCourse(moduleId) {
        try {
            return await this.moduleRepository.findByIdWithCourse(moduleId);
        } catch (error) {
            console.error('Error getting module with course:', error);
            throw error;
        }
    }

    /**
     * Получить все модули с информацией о курсах
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив модулей с курсами
     */
    async getAllModulesWithCourses(options = {}) {
        try {
            return await this.moduleRepository.findAllWithCourses(options);
        } catch (error) {
            console.error('Error getting all modules with courses:', error);
            throw error;
        }
    }

    /**
     * Получить модуль с уроками
     * @param {number} moduleId - ID модуля
     * @returns {Promise<Object|null>} - Модуль с уроками или null
     */
    async getModuleWithLessons(moduleId) {
        try {
            return await this.moduleRepository.findByIdWithLessons(moduleId);
        } catch (error) {
            console.error('Error getting module with lessons:', error);
            throw error;
        }
    }

    /**
     * Поиск модулей по названию
     * @param {string} title - Название модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив модулей
     */
    async searchModulesByTitle(title, options = {}) {
        try {
            return await this.moduleRepository.findByTitle(title, options);
        } catch (error) {
            console.error('Error searching modules by title:', error);
            throw error;
        }
    }

    /**
     * Получить количество модулей в курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>} - Количество модулей
     */
    async getModuleCountByCourseId(courseId) {
        try {
            return await this.moduleRepository.countByCourseId(courseId);
        } catch (error) {
            console.error('Error getting module count by course ID:', error);
            throw error;
        }
    }

    /**
     * Получить модули с пагинацией
     * @param {number} courseId - ID курса
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>} - Объект с модулями и метаданными пагинации
     */
    async getPaginatedModules(courseId, page = 1, limit = 10) {
        try {
            return await this.moduleRepository.findPaginatedByCourseId(courseId, page, limit);
        } catch (error) {
            console.error('Error getting paginated modules:', error);
            throw error;
        }
    }

    /**
     * Создать новый модуль
     * @param {Object} moduleData - Данные модуля
     * @returns {Promise<Object>} - Созданный модуль
     */
    async createModule(moduleData) {
        try {
            return await this.moduleRepository.create(moduleData);
        } catch (error) {
            console.error('Error creating module:', error);
            throw error;
        }
    }

    /**
     * Обновить модуль
     * @param {number} moduleId - ID модуля
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise<Object|null>} - Обновленный модуль или null
     */
    async updateModule(moduleId, updateData) {
        try {
            return await this.moduleRepository.update(moduleId, updateData);
        } catch (error) {
            console.error('Error updating module:', error);
            throw error;
        }
    }

    /**
     * Удалить модуль
     * @param {number} moduleId - ID модуля
     * @returns {Promise<boolean>} - Результат удаления
     */
    async deleteModule(moduleId) {
        try {
            return await this.moduleRepository.delete(moduleId);
        } catch (error) {
            console.error('Error deleting module:', error);
            throw error;
        }
    }

    /**
     * Проверить существование модуля
     * @param {number} moduleId - ID модуля
     * @returns {Promise<boolean>} - Существует ли модуль
     */
    async moduleExists(moduleId) {
        try {
            return await this.moduleRepository.exists({ id: moduleId });
        } catch (error) {
            console.error('Error checking module existence:', error);
            throw error;
        }
    }
}

module.exports = ModuleService;
