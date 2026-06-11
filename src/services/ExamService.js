const ExamRepository = require("../repository/ExamRepository");
const { sequelize } = require('../database/db');
const logger = require("../logger/Logger");

class ExamService{

    constructor() {
        this.examRepository = new ExamRepository();
    }

    /**
     * Получить домашнюю работу
     * @param examId
     * @returns {Promise<Object|null>}
     */
    async getExam(examId) {
        return await this.examRepository.findById(examId);
    }

    /**
     * Получить все домашние задания студента
     * @param student
     * @returns {Promise<Array<Exam>>}
     */
    async getStudentExams(student){
        try {
            return await this.examRepository.getStudentExams(student);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = ExamService;