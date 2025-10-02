// repositories/StudentRepository.js
const Student  = require('../models/student');
const {NotFoundError, UnauthorizedError} = require("../utils/errors");

class StudentRepository {

    static async createStudent(studentData, options = {}) {
        const student = await Student.create({
            telegram_id: studentData.id.toString(),
            username: studentData.username,
            firstname: studentData.first_name,
            lastname: studentData.last_name,
        }, {
            transaction: options.transaction,
            validate: true
        });

        return { student: student, created: true };
    }

    static async findStudentByTelegramId(userId, options = {}) {
        const student =  await Student.findOne({
            where: { telegram_id: userId },
            include: options.include || [],
            transaction: options.transaction
        });

        if (!student) {
            throw new NotFoundError('Telegram ID not found');
        }

        return student;
    }

    static async findOrCreateStudent(studentData, options = {}) {
        const [student, created] = await Student.findOrCreate({
            where: { telegram_id: studentData.id.toString() },
            include: options.include || [],
            defaults: {
                telegram_id: studentData.id.toString(),
                username: studentData.username,
                firstname: studentData.first_name,
                lastname: studentData.last_name,
                role: 'guest',
                registered_at: new Date(),
                updated_at: new Date()
            },
            transaction: options.transaction
        })

        return { student, created };
    }
}

module.exports = StudentRepository;