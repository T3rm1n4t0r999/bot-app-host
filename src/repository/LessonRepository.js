const BaseRepository = require('./BaseRepository');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');

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
                { moduleId,  is_active: true, },
                {
                    order: [['order', 'ASC']],
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

