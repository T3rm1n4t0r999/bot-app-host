const BaseRepository = require('./baseRepository');
const Module = require('../models/module');
const Course = require('../models/course');
const Lesson = require('../models/lesson');

class ModuleRepository extends BaseRepository {
    constructor() {
        super(Module);
    }

    /**
     * Получить модули по ID курса
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCourseId(courseId, options = {}) {
        try {
            return await this.findByCondition(
                { courseId },
                {
                    order: [['id', 'ASC']],
                    ...options
                }
            );
        } catch (error) {
            console.error('Error finding modules by course ID:', error);
            throw error;
        }
    }

}

module.exports = ModuleRepository;

