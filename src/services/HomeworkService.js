const HomeworkRepository = require("../repository/HomeworkRepository");
const { sequelize } = require('../database/db');
const logger = require("../logger/Logger");

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
     * @param student
     * @returns {Promise<Array<Homework>>}
     */
    async getStudentHomeworks(student){
        try {
            return await this.homeworkRepository.getStudentHomeworks(student);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = homeworkService;