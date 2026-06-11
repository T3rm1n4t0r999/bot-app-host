const BaseRepository = require('./BaseRepository');
const Module = require('../Models/Module');
const Course = require('../Models/Course');
const Lesson = require('../Models/Lesson');

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
            return await this.model.findAndCountAll({
                where: { courseId, is_active: true },
                order: [['order', 'ASC']],
                limit: options.limit,
                offset: options.offset
            });
        } catch (error) {
            console.error('Error finding modules by course ID:', error);
            throw error;
        }
    }

}

module.exports = ModuleRepository;

