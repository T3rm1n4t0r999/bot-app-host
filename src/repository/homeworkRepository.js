const BaseRepository = require("./baseRepository");
const StudentHomework = require("../models/studentHomework");
const Homework = require("../models/homework");
const logger = require("../logger/logger");
const {sequelize} = require("../models");
class HomeworkRepository extends BaseRepository {
    constructor() {
        super(Homework);
    }

    /**
     * Получает все homework для студента через studentHomework
     * @param {number} studentId - ID студента
     * @returns {Promise<Array<Homework>>} - Массив homework
     */
    async getStudentHomeworks(studentId) {
        try {
            return await this.findAll({
                include: [{
                    model: StudentHomework,
                    as: 'studentSubmissions',
                    where: { studentId: studentId },
                    required: true
                }]
            });
        } catch (e) {
            logger.error("Error getting student homeworks", e);
            throw e;
        }
    }

    /**
     * Получает homework по taskId для студента
     * @param {number} taskId - ID задания
     * @returns {Promise<Homework|null>} - Homework или null
     */
    async getHomeworkByTaskId( taskId) {
        try {
            return await this.findOne({where: {
                taskId: taskId
                }
            });
        } catch (e) {
            logger.error("Error finding homework by taskId: ", e);
            throw e;
        }
    }

    /**
     * Добавить домашнее задание студенту
     * @param studentId
     * @param homeworkId
     * @param options
     * @returns {Promise<[Model<any, TModelAttributes>, boolean]>}
     */
    async addHomeworkToStudent(studentId, homeworkId, options = {}) {
        try {
            return await StudentHomework.findOrCreate({
                where: {
                    studentId: studentId,
                    homeworkId: homeworkId,
                },
                ...options
            });
        } catch (error) {
            logger.error('Error assigning homework:', error);
            throw error;
        }
    }
}
module.exports = HomeworkRepository;