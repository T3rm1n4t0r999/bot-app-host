const LessonRepository = require('../repository/lessonRepository');
const LessonMaterialRepository = require('../repository/lessonMaterialRepository');
const LessonTaskRepository = require("../repository/lessonTaskRepository");

class LessonService {
    constructor() {
        this.lessonRepository = new LessonRepository();
        this.lessonMaterialRepository = new LessonMaterialRepository();
        this.lessonTaskRepository = new LessonTaskRepository();
    }

    /**
     * Получить все уроки для конкретного модуля
     * @param {number} moduleId - ID модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив уроков
     */
    async getLessonsByModuleId(moduleId, options = {}) {
        try {
            return await this.lessonRepository.findByModuleId(moduleId, options);
        } catch (error) {
            console.error('Error getting lessons by module ID:', error);
            throw error;
        }
    }

    async getByIdWithFiles(materialId, options = {}) {
        try {
            return await this.lessonMaterialRepository.findByIdWithFiles(materialId, options);
        } catch (e) {
            console.error('Error getting material by material ID');
        }
    }
    /**
     * Получить урок по ID
     * @param {number} lessonId - ID урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Object|null>} - Урок или null
     */
    async getLessonById(lessonId, options = {}) {
        try {
            return await this.lessonRepository.findById(lessonId, options);
        } catch (error) {
            console.error('Error getting lesson by ID:', error);
            throw error;
        }
    }

    /**
     * Получить все обучающие материалы по ID урока
     * @param {number} lessonId - ID урока
     * @returns {Promise<Array>}
     */
    async getLessonMaterialsByLessonId(lessonId) {
        try {
            return await this.lessonMaterialRepository.findByLessonId(lessonId);
        } catch (error) {
            console.error('Error getting lesson materials by lesson ID:', error);
            throw new Error(`Failed to get lesson materials: ${error.message}`);
        }
    }

    async getLessonTask(lessonId){
        try {
            return await this.lessonTaskRepository.findByLessonId(lessonId);
        } catch (e) {
            console.error('Error getting task by lesson ID:', error);
            throw new Error(`Failed to get task: ${e.message}`);
        }
    }


    async getLessonByLessonTaskId(lessonTaskId) {
        try {
            return await this.lessonTaskRepository.findById(lessonTaskId);
        } catch (e) {
            console.error('Error getting task questions');
            throw new Error(`Failed to get qestions: ${e.message}`);
        }
    }
}

module.exports = LessonService;
