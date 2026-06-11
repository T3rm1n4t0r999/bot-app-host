const LessonRepository = require('../repository/LessonRepository');
const LessonMaterialRepository = require('../repository/LessonMaterialRepository');
const LessonTaskRepository = require("../repository/LessonTaskRepository");
const StudentProgressRepository = require("../repository/StudentProgressRepository");
const HomeworkRepository = require("../repository/HomeworkRepository");

class LessonService {
    constructor() {
        this.lessonRepository = new LessonRepository();
        this.lessonMaterialRepository = new LessonMaterialRepository();
        this.lessonTaskRepository = new LessonTaskRepository();

    }



    async getTaskContext(entityType, entityId){
        if (entityType === 'lesson_task') {
            return await this.lessonTaskRepository.getContextById(entityId);
        }
        return { lessonId: null, moduleId: null };
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

    async getLessonTasksByLessonId(lessonId) {
        try {
            return await this.lessonTaskRepository.findByLessonId(lessonId);
        } catch (error) {
            console.error('Error getting lesson tasks by lesson ID:', error);
            throw new Error(`Failed to get lesson tasks: ${error.message}`);
        }
    }

    async getLessonTask(taskId){
        try {
            return await this.lessonTaskRepository.findById(taskId);
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
