const BaseRepository = require('./baseRepository');
const Course = require('../models/course');
const { StudentCourse, GroupCourse } = require("../models");

class CourseRepository extends BaseRepository {
    constructor() {
        super(Course);
    }

    async getStudentCourses(student, options = {}) {
        try {
            return await this.model.findAll({
                include: [{
                    model: StudentCourse,
                    as: 'studentCourses',
                    where: {
                        organization_id: student.organization_id,
                        studentId: student.id
                    },
                    required: true // INNER JOIN
                }],
                where: {
                    organization_id: student.organization_id,
                    is_active: true
                },
                order: [['order', 'ASC']],
                ...options
            });
        } catch(error) {
            console.error('Error in getStudentCourses:', error);
            throw error;
        }
    }

    async getAutoAssignedCourses(student, options = {}) {
        try {
            return await this.model.findAll({
                where: {
                    organization_id: student.organization_id,
                    auto_assign: true,
                },
                ...options
            });
        } catch(error) {
            console.error('Error in getStudentCourses:', error);
            throw error;
        }
    }

    async getGroupAssignedCourses(groupId, options = {}) {
        try {
            return await this.model.findAll({
                include: [{
                    model: GroupCourse,
                    as: 'groupCourses',
                    where: {
                        group_id: groupId,
                    },
                    required: true
                }],
                ...options
            });
        } catch (e) {
            throw e;
        }
    }

    async assignCourses(student, courses, options = {}) {
        const transaction = options.transaction;
        const grantedBy = options.grantedBy || 'system';

        const studentId = student?.id ?? student;

        try {
            const studentCoursesData = courses.map(course => ({
                studentId: studentId,
                courseId: course.id,
                organization_id: student.organization_id,
                grantedBy: grantedBy,
                grantedAt: new Date()
            }));

            return await StudentCourse.bulkCreate(studentCoursesData, {
                transaction,
                ignoreDuplicates: true
            });

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {

                return [];
            }

            throw error;
        }
    }
}

module.exports = CourseRepository;