const LessonService = require("./lessonService");
const RedisService = require("./redisService");
const StudentProgressRepository = require("../repository/studentProgressRepository");

class TaskService{
    constructor(){
        this.lessonService = new LessonService();
        this.progressRepo = new StudentProgressRepository();
    }
}

module.exports = new TaskService();
