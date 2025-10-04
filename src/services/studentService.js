const StudentRepository = require("../repository/studentRepository");
const { sequelize } = require('../database/db');
const StudentCacheManager = require("../utils/studentCacheManager");

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
        let transaction = null;
        try {
            const telegramId = userData.id.toString();
            transaction = await sequelize.transaction();
            
            // Проверяем, существует ли студент
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
                
                student = await this.studentRepository.create(studentData);
            }
            
            await transaction.commit();
            return student;
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

    /**
     * Получение профиля студента
     * @param {string} telegramId - Telegram ID студента
     * @returns {Promise<Object|null>}
     */
    async getStudentProfile(telegramId) {
        try {
            return await this.studentRepository.findByTelegramId(telegramId);
        } catch (error) {
            console.error('Ошибка в StudentService.getStudentProfile:', error);
            throw error;
        }
    }

    /**
     * Получение всех студентов
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async getAllStudents(options = {}) {
        try {
            return await this.studentRepository.findAll(options);
        } catch (error) {
            console.error('Ошибка в StudentService.getAllStudents:', error);
            throw error;
        }
    }

    /**
     * Получение студентов с курсами
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async getStudentsWithCourses(options = {}) {
        try {
            return await this.studentRepository.findAllWithCourses(options);
        } catch (error) {
            console.error('Ошибка в StudentService.getStudentsWithCourses:', error);
            throw error;
        }
    }

    /**
     * Получение доступных курсов студента
     * @param {number} studentId - ID студента
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(studentId) {
        try {
            return await this.studentRepository.getAccessibleCourses(studentId);
        } catch (error) {
            console.error('Ошибка в StudentService.getAccessibleCourses:', error);
            throw error;
        }
    }

    /**
     * Добавление курса студенту
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<Object>}
     */
    async addCourseToStudent(studentId, courseId) {
        try {
            return await this.studentRepository.addCourse(studentId, courseId);
        } catch (error) {
            console.error('Ошибка в StudentService.addCourseToStudent:', error);
            throw error;
        }
    }

    /**
     * Удаление курса у студента
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<boolean>}
     */
    async removeCourseFromStudent(studentId, courseId) {
        try {
            return await this.studentRepository.removeCourse(studentId, courseId);
        } catch (error) {
            console.error('Ошибка в StudentService.removeCourseFromStudent:', error);
            throw error;
        }
    }

    /**
     * Проверка доступа студента к курсу
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<boolean>}
     */
    async hasAccessToCourse(studentId, courseId) {
        try {
            return await this.studentRepository.hasAccessToCourse(studentId, courseId);
        } catch (error) {
            console.error('Ошибка в StudentService.hasAccessToCourse:', error);
            throw error;
        }
    }

    /**
     * Получение студентов по роли
     * @param {string} role - Роль студента
     * @returns {Promise<Array>}
     */
    async getStudentsByRole(role) {
        try {
            return await this.studentRepository.findByRole(role);
        } catch (error) {
            console.error('Ошибка в StudentService.getStudentsByRole:', error);
            throw error;
        }
    }

    /**
     * Обновление профиля студента
     * @param {number} studentId - ID студента
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise<Object|null>}
     */
    async updateStudentProfile(studentId, updateData) {
        try {
            return await this.studentRepository.update(studentId, updateData);
        } catch (error) {
            console.error('Ошибка в StudentService.updateStudentProfile:', error);
            throw error;
        }
    }
}

module.exports = StudentService;