const StudentRepository = require("../repository/studentRepository");
const { sequelize } = require('../database/db');
const logger = require("../logger/logger");

class StudentService {
    constructor() {
        this.studentRepository = new StudentRepository();
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
                // Создаем нового студента
                const studentData = {
                    telegram_id: telegramId,
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
}

module.exports = StudentService;