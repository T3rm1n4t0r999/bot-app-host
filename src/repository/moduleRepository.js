const BaseRepository = require('./baseRepository');
const Module = require('../models/module');
const Course = require('../models/course');
const Lesson = require('../models/lesson');

class ModuleRepository extends BaseRepository {
    constructor() {
        super(Module);
    }

    /**
     * Получить модули по ID курса
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCourseId(courseId, options = {}) {
        try {
            return await this.findByCondition(
                { courseId },
                {
                    order: [['id', 'ASC']],
                    ...options
                }
            );
        } catch (error) {
            console.error('Error finding modules by course ID:', error);
            throw error;
        }
    }

    /**
     * Получить модуль с информацией о курсе
     * @param {number} moduleId - ID модуля
     * @returns {Promise<Object|null>}
     */
    async findByIdWithCourse(moduleId) {
        try {
            return await this.findById(moduleId, {
                include: [{
                    model: Course,
                    as: 'course'
                }]
            });
        } catch (error) {
            console.error('Error finding module with course:', error);
            throw error;
        }
    }

    /**
     * Получить все модули с информацией о курсах
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAllWithCourses(options = {}) {
        try {
            return await this.findAll({
                include: [{
                    model: Course,
                    as: 'course'
                }],
                order: [['courseId', 'ASC'], ['id', 'ASC']],
                ...options
            });
        } catch (error) {
            console.error('Error finding all modules with courses:', error);
            throw error;
        }
    }

    /**
     * Получить модуль с уроками
     * @param {number} moduleId - ID модуля
     * @returns {Promise<Object|null>}
     */
    async findByIdWithLessons(moduleId) {
        try {
            return await this.findById(moduleId, {
                include: [{
                    model: Lesson,
                    as: 'lessons',
                    order: [['id', 'ASC']]
                }]
            });
        } catch (error) {
            console.error('Error finding module with lessons:', error);
            throw error;
        }
    }

    /**
     * Получить модули по названию (поиск)
     * @param {string} title - Название модуля
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
            console.error('Error finding modules by title:', error);
            throw error;
        }
    }

    /**
     * Получить количество модулей в курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async countByCourseId(courseId) {
        try {
            return await this.count({ courseId });
        } catch (error) {
            console.error('Error counting modules by course ID:', error);
            throw error;
        }
    }

    /**
     * Получить модули с пагинацией
     * @param {number} courseId - ID курса
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>}
     */
    async findPaginatedByCourseId(courseId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await this.model.findAndCountAll({
                where: { courseId },
                order: [['id', 'ASC']],
                limit,
                offset
            });

            return {
                modules: rows,
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(count / limit),
                hasPrevPage: page > 1
            };
        } catch (error) {
            console.error('Error finding paginated modules:', error);
            throw error;
        }
    }
}

module.exports = ModuleRepository;

