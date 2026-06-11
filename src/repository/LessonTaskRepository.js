// repositories/LessonTaskRepository.js
const BaseRepository = require('./BaseRepository');
const LessonTask = require('../models/LessonTask');
const File = require('../models/File');
const StudentProgress = require('../models/StudentProgress');
const {Lesson, Module} = require("../models");

class LessonTaskRepository extends BaseRepository {
    constructor() {
        super(LessonTask);
    }

    /**
     * Получить задания по ID урока
     * @param {number} lessonId - ID урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByLessonId(lessonId) {
        try {
            return await this.findByCondition(
                { lessonId, is_active: true,},
                {order: [['order', 'ASC']]},
            );

        } catch (error) {
            console.error('Error finding lesson materials by lesson ID:', error);
            throw error;
        }
    }

    async findByModuleId(moduleId) {
        return await this.model.findAll({
            include: [{
                model: Lesson,
                as: 'lesson',
                where: { module_id: moduleId, is_active: true },
                required: true
            }],
            where: { is_active: true }
        });
    }

    /**
     * Получить урок и модуль по ID задания урока
     * @param {number} taskId
     * @returns {Promise<{lessonId: number|null, moduleId: number|null}>}
     */
    async getContextById(taskId) {
        const task = await this.findById(taskId, {
            include: [{
                model: Lesson,
                as: 'lesson',
                include: [{ model: Module, as: 'module' }]
            }]
        });
        return {
            lessonId: task?.lesson?.id ?? null,
            moduleId: task?.lesson?.module?.id ?? null,
        };
    }
}

module.exports = LessonTaskRepository;