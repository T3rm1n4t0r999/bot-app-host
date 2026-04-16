const BaseRepository = require('./baseRepository');
const Trainer = require('../models/trainer');

class TrainerRepository extends BaseRepository {
    constructor() {
        super(Trainer);
    }

    /**
     * Получить все курсы
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAll(options = {}) {
        try {
            return await super.findAll(options);
        } catch (error) {
            console.error('Error finding all courses:', error);
            throw error;
        }
    }
}

module.exports = TrainerRepository;