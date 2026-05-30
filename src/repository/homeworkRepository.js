const BaseRepository = require("./baseRepository");
const StudentHomework = require("../models/studentHomework");
const Homework = require("../models/homework");
const logger = require("../logger/logger");
const {sequelize, StudentCourse} = require("../models");
class HomeworkRepository extends BaseRepository {
    constructor() {
        super(Homework);
    }


    async getActiveByLesson(lessonId) {
        return await this.model.findOne({
            where: { lesson_id: lessonId, is_active: true }
        });
    }


    /**
     * Назначить домашнее задание студенту (создать запись, если её нет)
     * @param {object} data - { studentId, homeworkId, organizationId, grantedBy, grantedAt }
     * @returns {Promise<[object, boolean]>}
     */
    async assignToStudent(data) {
        return await StudentHomework.findOrCreate({
            where: {
                studentId: data.studentId,       // camelCase
                homeworkId: data.homeworkId
            },
            defaults: {
                organizationId: data.organizationId,  // camelCase
                grantedBy: data.grantedBy || 'auto',
                grantedAt: data.grantedAt || new Date()
            }
        });
    }

    /**
     * Получает все homework для студента через studentHomework
     * @param {number} student - студент
     * @param options
     * @returns {Promise<Array<Homework>>} - Массив homework
     */
    async getStudentHomeworks(student, options = {}) {
        try {
            return await this.model.findAll({
                include: [{
                    model: StudentHomework,
                    as: 'studentHomeworks',
                    where: {
                        studentId: student.id // ИСПРАВЛЕНО: student_id -> studentId (имя атрибута в модели)
                    },
                    required: true // INNER JOIN
                }],
                where: {
                    is_active: true
                },
                order: [['id', 'DESC']],
                ...options
            });
        } catch(error) {
            console.error('Error in getStudentHomework:', error);
            throw error;
        }
    }
}
module.exports = HomeworkRepository;