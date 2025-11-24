const HomeworkRepository = require("../repository/homeworkRepository");
const { sequelize } = require('../database/db');
const logger = require("../logger/logger");

class homeworkService{

    constructor() {
        this.homeworkRepository = new HomeworkRepository();
    }

    async getHomework(homeworkId) {
        return await this.homeworkRepository.findById(homeworkId);
    }

    async getStudentHomeworks(studentId){
        try {
            return await this.homeworkRepository.getStudentHomeworks(studentId);
        } catch (e) {
            logger.error("Error getting student homeworks",e);
            throw e;
        }
    }

    async addHomeworkToStudent(studentId, taskId){
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
    
    async getHomeworkQuestionById(questionId){
        try {
            return await this.homeworkQuestionRepository.findById(questionId);
        } catch (e) {
            logger.error("Error getting homework question by id", e);
        }
    }
}

module.exports = homeworkService;