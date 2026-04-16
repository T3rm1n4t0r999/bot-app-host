// repositories/lessonTaskRepository.js
const BaseRepository = require('./baseRepository');
const LessonTask = require('../models/lessonTask');
const File = require('../models/file');
const StudentProgress = require('../models/studentProgress');

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
                { lessonId },
            );

        } catch (error) {
            console.error('Error finding lesson materials by lesson ID:', error);
            throw error;
        }
    }
}

module.exports = LessonTaskRepository;