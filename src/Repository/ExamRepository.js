const BaseRepository = require("./BaseRepository");
const StudentExam = require("../Models/StudentExam");
const Exam = require("../Models/Exam");
const logger = require("../Logger/Logger");
const {sequelize, StudentCourse} = require("../Models");
class ExamRepository extends BaseRepository {
    constructor() {
        super(Exam);
    }

    /**
     * Получает все exam для студента через studentExam
     * @param {number} student - студент
     * @param options
     * @returns {Promise<Array<Exam>>} - Массив exam
     */
    async getStudentExams(student, options = {}) {
        try {
            return await this.model.findAll({
                include: [{
                    model: StudentExam,
                    as: 'studentExams',
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
            console.error('Error in getStudentExam:', error);
            throw error;
        }
    }

    async assignToStudent(data) {
        return await StudentExam.findOrCreate({
            where: {
                studentId: data.studentId,
                examId: data.examId
            },
            defaults: {
                organizationId: data.organizationId,
                grantedBy: data.grantedBy || 'system',
                grantedAt: data.grantedAt || new Date()
            }
        });
    }

    async getActiveByModule(moduleId) {
        return await this.model.findOne({
            where: { module_id: moduleId, is_active: true }
        });
    }
}
module.exports = ExamRepository;