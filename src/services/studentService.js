const StudentRepository = require("../repository/studentRepository");
const StudentProgressRepository = require("../repository/studentProgressRepository");
const { sequelize } = require('../database/db');
const logger = require("../logger/logger");

class StudentService {
    constructor() {
        this.studentRepository = new StudentRepository();
        this.studentProgressRepo = new StudentProgressRepository();
    }

    /**
     * Регистрация студента
     * @param {Object} userData - Данные пользователя
     * @returns {Promise<Object>}
     */
    async registerStudent(userData) {
        const transaction = await sequelize.transaction();
        try {
            const telegramId = userData.id.toString();

            let student = await this.studentRepository.findByTelegramId(telegramId);
            if (!student) {
                const studentData = {
                    telegramId: telegramId,
                    firstname: userData.first_name || '',
                    lastname: userData.last_name || '',
                    username: userData.username || '',
                    role: 'student'
                };
                
                student = await this.studentRepository.create(studentData, { transaction });
            }
            
            await transaction.commit();
            return student;
        } catch (error) {
            await transaction.rollback();
            logger.error("Error while registering student",error);
            throw error;
        }
    }

    /**
     * Получить таблицу лидеров
     * @param limit
     * @returns {Promise<Array>}
     */
    async getLeaderboard(limit = 10){
        try {
            return await this.studentRepository.getStudentsByScore(limit);
        } catch (e) {
            logger.error("Error while getting leaderboard",e);
        }
    }

    /**
     * Получение профиля студента
     * @param {string} telegramId - Telegram ID студента
     * @returns {Promise<Object|null>}
     */
    async getStudentProfile(telegramId) {
        try {
            return await this.studentRepository.findByTelegramId(telegramId);
        } catch (error) {
            logger.error('Error while getting student profile', error);
            throw error;
        }
    }

    /**
     * Добавить баллы студенту
     * @param studentId
     * @param points
     * @returns {Promise<void>}
     */
    async addPoints(studentId, points) {
        const transaction = await sequelize.transaction();
        try {
            await this.studentRepository.addPoints(studentId, points, {transaction});
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error("Error while adding points to student",error);
            throw error;
        }
    }

    /**
     * Сохранить прогресс студента
     * @param progressData
     * @returns {Promise<Object>}
     */
    async saveStudentResults(progressData)  {
        const transaction = await sequelize.transaction();
        try{
            const newResult = await this.studentProgressRepo.saveStudentResults(progressData, {transaction});
            await transaction.commit();
            return newResult;
        } catch (e) {
            await transaction.rollback();
            logger.error(e);
            throw e;
        }
    }

    /**
     * Найти лучший результат студента
     * @param studentId
     * @param entityType
     * @param entityId
     * @returns {Promise<Object|null>}
     */
    async findBestResult(studentId, entityType, entityId){
        try {
            return await this.studentProgressRepo.findBestResult(studentId, entityType, entityId);
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }
}

module.exports = StudentService;