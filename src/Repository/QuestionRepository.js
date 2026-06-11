const BaseRepository = require(`./BaseRepository`);
const Question = require("../Models/Question");
const Logger = require("../Logger/Logger");
const {resolveModelType} = require("../Utils/ModelResolver");
const File = require('../Models/File');
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
                    is_active: true,
                },
                order: [["order", "ASC"]],
            });
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    async findByIdWithFiles(questionId) {
        try {
            return await Question.findByPk(questionId, {
                include: [{
                    model: File,
                    as: 'files',
                    required: false,
                }]
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
                    id: questionIds,
                    is_active: true,
                }
            });
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }
}

module.exports = QuestionRepository;