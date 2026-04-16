const BaseRepository = require('./baseRepository');
const Student = require('../models/student');
const StudentCourse = require('../models/studentCourse');
const Course = require('../models/course');
const logger = require('../logger/logger');

class StudentRepository extends BaseRepository {
    constructor() {
        super(Student);
    }

    /**
     * Найти студента по Telegram ID
     * @param {string} telegramId - Telegram ID студента
     * @returns {Promise<Object|null>}
     */
    async findByTelegramId(telegramId) {
        try {
            return await this.findOne({
                where:{
                    telegramId: telegramId
                }
            });
        } catch (error) {
            logger.error(`Error finding student by Telegram ID:${telegramId}`, error);
            throw error;
        }
    }

    /**
     * Получить студентов с сортировкой по баллам
     * @param limit
     * @returns {Promise<Array>}
     */
    async getStudentsByScore(limit = 10){
        try {
            return await this.findAll({
                attributes: ['id', 'username', 'score'],
                order: [['score', 'DESC']],
                limit: limit,
            });
        } catch (e) {
            logger.error("Error while getting leaderboard",e);
        }
    }

    /**
     * Добавить баллы студенту
     * @param studentId
     * @param points
     * @param options
     * @returns {Promise<Array>}
     */
    async addPoints(studentId, points, options = {}) {
        try {
            return await this.increment('score', {
                by: points,
                where: {id: studentId}
            })
        } catch (e) {
            throw e;
        }
    }
}

module.exports = StudentRepository;