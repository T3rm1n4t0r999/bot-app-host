const LessonService = require("./lessonService");
const StudentProgressRepository = require("../repository/studentProgressRepository");
const {sequelize} = require("../database/db");
const logger = require("../logger/logger");
class TaskService{
    constructor(){
        this.lessonService = new LessonService();
        this.progressRepo = new StudentProgressRepository();
    }

    async findOrCreateProgress(studentId, taskId){
        const transaction = await sequelize.transaction();
        try {
            const progress = await this.progressRepo.findOrCreateProgress(studentId, taskId, {transaction});
            await transaction.commit();
            return progress;
        } catch (e) {
            await transaction.rollback();
            logger.error('Error finding or creating student progress:', e);
            throw e;
        }
    }

    async completeTask(studentId, taskId, result){
        const transaction = await sequelize.transaction();
        try {
            const completedTask = await this.progressRepo.completeTask(studentId, taskId, result, {transaction});
            await transaction.commit();
            return completedTask;
        } catch (e) {
            await transaction.rollback();
            logger.error('Error complete task:', e);
            throw e;
        }
    }
}

module.exports = TaskService;
