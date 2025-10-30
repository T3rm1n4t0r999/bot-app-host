const LessonService = require("./lessonService");
const StudentProgressRepository = require("../repository/studentProgressRepository");
const progressRepo = require("../repository/studentProgressRepository");

class TaskService{
    constructor(){
        this.lessonService = new LessonService();
        this.progressRepo = new StudentProgressRepository();
    }

    async findOrCreateProgress(studentId, taskId){
        try {
            return await this.progressRepo.findOrCreateProgress(studentId, taskId);
        } catch (e) {
            console.error('Error finding or creating student progress:', e);
            throw e;
        }
    }

    async completeTask(studentId, taskId, result){
        try {
            return await this.progressRepo.completeTask(studentId, taskId, result);
        } catch (e) {
            console.error('Error complete task:', e);
            throw e;
        }
    }
}

module.exports = TaskService;
