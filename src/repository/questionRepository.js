const BaseRepository = require(`./BaseRepository`);
const Question = require("../models/question");
const Logger = require("../logger/Logger");
class QuestionRepository extends BaseRepository {
    constructor() {
        super(Question);
    }

    /**
     * Найти все вопросы
     * @param entityId
     * @param entityType
     * @returns {Promise<Array>}
     */
    async findAllQuestions(entityId, entityType) {
        try {
            return await this.findAll({
                where: {
                    questionableId: entityId,
                    questionableType: entityType,
                },
                order: [["order", "ASC"]],
            });
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    /**
     * Найти все вопросы по номеру
     * @param questionIds
     * @returns {Promise<Array>}
     */
    async findByIds(questionIds) {
        try {
            return await this.findAll({
                where: {
                    id: questionIds
                }
            });
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }
}

module.exports = QuestionRepository;