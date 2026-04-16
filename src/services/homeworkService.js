const HomeworkRepository = require("../repository/homeworkRepository");
const { sequelize } = require('../database/db');
const logger = require("../logger/logger");

class homeworkService{

    constructor() {
        this.homeworkRepository = new HomeworkRepository();
    }

    /**
     * Получить домашнюю работу
     * @param homeworkId
     * @returns {Promise<Object|null>}
     */
    async getHomework(homeworkId) {
        return await this.homeworkRepository.findById(homeworkId);
    }

    /**
     * Получить все домашние задания студента
     * @param studentId
     * @returns {Promise<Array<Homework>>}
     */
    async getStudentHomeworks(studentId){
        try {
            return await this.homeworkRepository.getStudentHomeworks(studentId);
        } catch (e) {
            logger.error("Error getting student homeworks",e);
            throw e;
        }
    }

    /**
     * Добавить домашнее задание студенту по номеру практического задания
     * @param studentId
     * @param taskId
     * @returns {Promise<[Model<*, TModelAttributes>,boolean]>}
     */
    async addHomeworkToStudentByTaskId(studentId, taskId){
        const transaction = await sequelize.transaction();
        try {
            const existingHomework = await this.homeworkRepository.getHomeworkByTaskId(taskId);

            if (!existingHomework) {
                return;
            }
            const homeworkId = existingHomework.id;
            const homework = await this.homeworkRepository.addHomeworkToStudent(studentId, homeworkId);
            await transaction.commit();
            return homework;
        } catch (e) {
            await transaction.rollback();
            logger.error("Error adding homework to student", e);
            throw e;
        }
    }
}

module.exports = homeworkService;