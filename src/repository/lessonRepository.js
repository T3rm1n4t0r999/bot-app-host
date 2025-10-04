const BaseRepository = require('./baseRepository');
const Lesson = require('../models/lesson');
const Module = require('../models/module');
const Course = require('../models/course');

class LessonRepository extends BaseRepository {
    constructor() {
        super(Lesson);
    }

    /**
     * Получить уроки по ID модуля
     * @param {number} moduleId - ID модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByModuleId(moduleId, options = {}) {
        try {
            return await this.findByCondition(
                { moduleId },
                {
                    order: [['id', 'ASC']],
                    ...options
                }
            );
        } catch (error) {
            console.error('Error finding lessons by module ID:', error);
            throw error;
        }
    }

    /**
     * Получить урок с информацией о модуле
     * @param {number} lessonId - ID урока
     * @returns {Promise<Object|null>}
     */
    async findByIdWithModule(lessonId) {
        try {
            return await this.findById(lessonId, {
                include: [{
                    model: Module,
                    as: 'module',
                    include: [{
                        model: Course,
                        as: 'course'
                    }]
                }]
            });
        } catch (error) {
            console.error('Error finding lesson with module:', error);
            throw error;
        }
    }

    /**
     * Получить все уроки с информацией о модулях и курсах
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findAllWithModulesAndCourses(options = {}) {
        try {
            return await this.findAll({
                include: [{
                    model: Module,
                    as: 'module',
                    include: [{
                        model: Course,
                        as: 'course'
                    }]
                }],
                order: [['moduleId', 'ASC'], ['id', 'ASC']],
                ...options
            });
        } catch (error) {
            console.error('Error finding all lessons with modules and courses:', error);
            throw error;
        }
    }

    /**
     * Получить уроки по названию (поиск)
     * @param {string} title - Название урока
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
            console.error('Error finding lessons by title:', error);
            throw error;
        }
    }

    /**
     * Получить уроки по содержимому (поиск)
     * @param {string} content - Содержимое урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByContent(content, options = {}) {
        try {
            return await this.findByCondition(
                { content: { [require('sequelize').Op.iLike]: `%${content}%` } },
                options
            );
        } catch (error) {
            console.error('Error finding lessons by content:', error);
            throw error;
        }
    }

    /**
     * Получить количество уроков в модуле
     * @param {number} moduleId - ID модуля
     * @returns {Promise<number>}
     */
    async countByModuleId(moduleId) {
        try {
            return await this.count({ moduleId });
        } catch (error) {
            console.error('Error counting lessons by module ID:', error);
            throw error;
        }
    }

    /**
     * Получить уроки с пагинацией
     * @param {number} moduleId - ID модуля
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>}
     */
    async findPaginatedByModuleId(moduleId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await this.model.findAndCountAll({
                where: { moduleId },
                order: [['id', 'ASC']],
                limit,
                offset
            });

            return {
                lessons: rows,
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(count / limit),
                hasPrevPage: page > 1
            };
        } catch (error) {
            console.error('Error finding paginated lessons:', error);
            throw error;
        }
    }

    /**
     * Получить уроки по курсу (через модули)
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCourseId(courseId, options = {}) {
        try {
            return await this.findAll({
                include: [{
                    model: Module,
                    as: 'module',
                    where: { courseId },
                    required: true
                }],
                order: [['moduleId', 'ASC'], ['id', 'ASC']],
                ...options
            });
        } catch (error) {
            console.error('Error finding lessons by course ID:', error);
            throw error;
        }
    }
}

module.exports = LessonRepository;

