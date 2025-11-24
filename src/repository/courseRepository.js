const BaseRepository = require('./baseRepository');
const Course = require('../models/course');
const StudentCourse = require('../models/studentCourse');
const Student = require('../models/student');
const Module = require('../models/module');

class CourseRepository extends BaseRepository {
    constructor() {
        super(Course);
    }

    /**
     * Получить все курсы
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAll(options = {}) {
        try {
            return await super.findAll(options);
        } catch (error) {
            console.error('Error finding all courses:', error);
            throw error;
        }
    }

    /**
     * Получить доступные курсы для студента
     * @param {Object} userData - Данные пользователя
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(userData) {
        try {
            const courses = await StudentCourse.findAll({
                where: { studentId: userData.id },
                include: [{
                    model: Course,
                    as: 'course',
                    required: true
                }],
            });
            return courses.map(studentCourse => studentCourse.course);
        } catch (error) {
            console.error('Error getting accessible courses:', error);
            throw error;
        }
    }

    /**
     * Получить курс с модулями
     * @param {number} courseId - ID курса
     * @returns {Promise<Object|null>}
     */
    async findByIdWithModules(courseId) {
        try {
            return await this.findById(courseId, {
                include: [{
                    model: Module,
                    as: 'modules',
                    order: [['id', 'ASC']]
                }]
            });
        } catch (error) {
            console.error('Error finding course with modules:', error);
            throw error;
        }
    }

    /**
     * Получить курс со студентами
     * @param {number} courseId - ID курса
     * @returns {Promise<Object|null>}
     */
    async findByIdWithStudents(courseId) {
        try {
            return await this.findById(courseId, {
                include: [{
                    model: Student,
                    as: 'studentsWithAccess',
                    through: {
                        attributes: []
                    }
                }]
            });
        } catch (error) {
            console.error('Error finding course with students:', error);
            throw error;
        }
    }

    /**
     * Получить курсы по названию (поиск)
     * @param {string} title - Название курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByTitle(title, options = {}) {
        try {
            return await this.findByCondition(
                { title: { [require('sequelize').Op.iLike]: `%${title}%` } },
                options
            );
        } catch (error) {
            console.error('Error finding courses by title:', error);
            throw error;
        }
    }

    /**
     * Получить количество студентов на курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async getStudentCount(courseId) {
        try {
            return await StudentCourse.count({ where: { courseId } });
        } catch (error) {
            console.error('Error getting student count:', error);
            throw error;
        }
    }

    /**
     * Получить количество модулей в курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async getModuleCount(courseId) {
        try {
            return await Module.count({ where: { courseId } });
        } catch (error) {
            console.error('Error getting module count:', error);
            throw error;
        }
    }
}

module.exports = CourseRepository;