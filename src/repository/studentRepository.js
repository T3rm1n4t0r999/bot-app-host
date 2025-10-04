const BaseRepository = require('./baseRepository');
const Student = require('../models/student');
const StudentCourse = require('../models/studentCourse');
const Course = require('../models/course');

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
            return await this.findOne({ telegram_id: telegramId });
        } catch (error) {
            console.error('Error finding student by Telegram ID:', error);
            throw error;
        }
    }

    /**
     * Найти студента по email
     * @param {string} email - Email студента
     * @returns {Promise<Object|null>}
     */
    async findByEmail(email) {
        try {
            return await this.findOne({ email });
        } catch (error) {
            console.error('Error finding student by email:', error);
            throw error;
        }
    }

    /**
     * Получить студентов с их курсами
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAllWithCourses(options = {}) {
        try {
            return await this.findAll({
                include: [{
                    model: Course,
                    as: 'accessibleCourses',
                    through: {
                        attributes: []
                    }
                }],
                ...options
            });
        } catch (error) {
            console.error('Error finding students with courses:', error);
            throw error;
        }
    }

    /**
     * Получить доступные курсы студента
     * @param {number} studentId - ID студента
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(studentId) {
        try {
            const studentCourses = await StudentCourse.findAll({
                where: { studentId },
                include: [{
                    model: Course,
                    as: 'course',
                    required: true
                }]
            });
            return studentCourses.map(studentCourse => studentCourse.course);
        } catch (error) {
            console.error('Error getting accessible courses:', error);
            throw error;
        }
    }

    /**
     * Добавить курс студенту
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<Object>}
     */
    async addCourse(studentId, courseId) {
        try {
            return await StudentCourse.create({
                studentId,
                courseId
            });
        } catch (error) {
            console.error('Error adding course to student:', error);
            throw error;
        }
    }

    /**
     * Удалить курс у студента
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<boolean>}
     */
    async removeCourse(studentId, courseId) {
        try {
            const studentCourse = await StudentCourse.findOne({
                where: { studentId, courseId }
            });
            
            if (!studentCourse) {
                return false;
            }
            
            await studentCourse.destroy();
            return true;
        } catch (error) {
            console.error('Error removing course from student:', error);
            throw error;
        }
    }

    /**
     * Проверить доступ студента к курсу
     * @param {number} studentId - ID студента
     * @param {number} courseId - ID курса
     * @returns {Promise<boolean>}
     */
    async hasAccessToCourse(studentId, courseId) {
        try {
            return await StudentCourse.exists({
                where: { studentId, courseId }
            });
        } catch (error) {
            console.error('Error checking course access:', error);
            throw error;
        }
    }

    /**
     * Получить студентов по роли
     * @param {string} role - Роль студента
     * @returns {Promise<Array>}
     */
    async findByRole(role) {
        try {
            return await this.findByCondition({ role });
        } catch (error) {
            console.error('Error finding students by role:', error);
            throw error;
        }
    }
}

module.exports = StudentRepository;