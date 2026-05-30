const BaseRepository = require('./baseRepository');
const Group = require('../models/group');

class GroupRepository extends BaseRepository {
    constructor() {
        super(Group);
    }

    /**
     * Получить все курсы
     * @param code
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCode(code, options = {}) {
        try {
            return await super.findOne({
                where: { code: code },
                ...options
            });
        } catch (error) {
            console.error('Error finding group by code:', error);
            throw error;
        }
    }

}

module.exports = GroupRepository;