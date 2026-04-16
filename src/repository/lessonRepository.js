const BaseRepository = require('./baseRepository');
const Lesson = require('../models/lesson');
const Module = require('../models/module');
const Course = require('../models/course');

class LessonRepository extends BaseRepository {
    constructor() {
        super(Lesson);
    }

    /**
     * Получить уроки по ID модуля
     * @param {number} moduleId - ID модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByModuleId(moduleId, options = {}) {
        try {
            return await this.findByCondition(
                { moduleId },
                {
                    order: [['id', 'ASC']],
                    ...options
                }
            );
        } catch (error) {
            console.error('Error finding lessons by module ID:', error);
            throw error;
        }
    }
}

module.exports = LessonRepository;

