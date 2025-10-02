const StudentRepository = require("../repository/studentRepository");
const { sequelize } = require('../database/db');
const StudentCacheManager = require("../utils/studentCacheManager");

class studentService {
    /**
     * Получение информации о студенте
     * @returns {Promise<Object>}
     * @param telegramId
     * @param status
     */


    static async registerStudent(userData) {
        let transaction = null;
        try {
            const telegramId = userData.id.toString();
            transaction = await sequelize.transaction();
            const result = await StudentRepository.findOrCreateStudent(userData, {transaction});
            await transaction.commit();
            return result;
        } catch (error) {
            if (transaction && !transaction.finished) {
                try {
                    await transaction.rollback();
                } catch (rollbackError) {
                    console.error('Rollback failed:', rollbackError);
                }
            }
            console.error("Ошибка в StudentService.registerStudent:", error);
            throw error;
        }
    }

    static async getStudentProfile(telegramId) {
        try {
            return await StudentRepository.findStudentByTelegramId(telegramId);
        } catch (error) {
            throw error;
        }
    }

}
module.exports = studentService;