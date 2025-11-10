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
            return await this.findOne({ telegram_id: telegramId });
        } catch (error) {
            logger.error(`Error finding student by Telegram ID:${telegramId}`, error);
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
            logger.error(`Error getting accessible courses for studentId:${studentId}`, error);
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
            logger.error(`Error checking course access for studentId: ${studentId}, course: ${courseId}`, error);
            throw error;
        }
    }

    async addPoints(studentId, points) {
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