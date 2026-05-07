const BaseRepository = require('./baseRepository');
const Bot = require('../models/bot');

class BotRepository extends BaseRepository {
    constructor() {
        super(Bot);
    }

    /**
     * Получить все курсы
     * @param username
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByUsername(username, options = {}) {
        try {
            return await super.findOne({
                where: { bot_url: username },
                ...options
            });
        } catch (error) {
            console.error('Error finding invitation by token:', error);
            throw error;
        }
    }

}

module.exports = BotRepository;