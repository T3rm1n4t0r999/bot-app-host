// repositories/lessonAssignmentRepository.js
const BaseRepository = require('./baseRepository');
const LessonAssignment = require('../models/lessonAssignment');
const AssignmentQuestion = require('../models/assignmentQuestion');
const File = require('../models/file');
const StudentProgress = require('../models/studentProgress');

class LessonAssignmentRepository extends BaseRepository {
    constructor() {
        super(LessonAssignment);
    }

    /**
     * Получить задания по ID урока
     * @param {number} lessonId - ID урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByLessonId(lessonId) {
        try {
            return await this.findByCondition(
                { lessonId },
            );

        } catch (error) {
            console.error('Error finding learning materials by lesson ID:', error);
            throw error;
        }
    }

    /**
     * Получить задание с вопросами и файлами
     * @param {number} assignmentId - ID задания
     * @returns {Promise<Object|null>}
     */
    async findByIdWithDetails(assignmentId) {
        try {
            return await this.findById(assignmentId, {
                include: [
                    {
                        model: AssignmentQuestion,
                        as: 'questions',
                        include: [{
                            model: File,
                            as: 'files'
                        }],
                        order: [['order', 'ASC']]
                    },
                    {
                        model: File,
                        as: 'files',
                        order: [['order', 'ASC']]
                    },
                    {
                        model: require('../models/lesson'),
                        as: 'lesson',
                        attributes: ['id', 'title', 'moduleId']
                    }
                ]
            });
        } catch (error) {
            console.error('Error finding assignment with details:', error);
            throw error;
        }
    }

    /**
     * Получить задания урока с полной информацией
     * @param {number} lessonId - ID урока
     * @returns {Promise<Array>}
     */
    async findByLessonIdWithDetails(lessonId) {
        try {
            return await this.findByCondition(
                { lessonId },
                {
                    include: [
                        {
                            model: AssignmentQuestion,
                            as: 'questions',
                            include: [{
                                model: File,
                                as: 'files'
                            }],
                            order: [['order', 'ASC']]
                        },
                        {
                            model: File,
                            as: 'files',
                            order: [['order', 'ASC']]
                        }
                    ],
                    order: [['id', 'ASC']]
                }
            );
        } catch (error) {
            console.error('Error finding assignments with details by lesson ID:', error);
            throw error;
        }
    }

    /**
     * Получить задание с прогрессом студента
     * @param {number} assignmentId - ID задания
     * @param {number} studentId - ID студента
     * @returns {Promise<Object|null>}
     */
    async findByIdWithStudentProgress(assignmentId, studentId) {
        try {
            return await this.findById(assignmentId, {
                include: [
                    {
                        model: AssignmentQuestion,
                        as: 'questions',
                        include: [{
                            model: File,
                            as: 'files'
                        }],
                        order: [['order', 'ASC']]
                    },
                    {
                        model: File,
                        as: 'files',
                        order: [['order', 'ASC']]
                    },
                    {
                        model: StudentProgress,
                        as: 'studentProgress',
                        where: { studentId },
                        required: false
                    },
                    {
                        model: require('../models/lesson'),
                        as: 'lesson',
                        attributes: ['id', 'title']
                    }
                ]
            });
        } catch (error) {
            console.error('Error finding assignment with student progress:', error);
            throw error;
        }
    }

    /**
     * Получить задания по сложности
     * @param {number} lessonId - ID урока
     * @param {string} difficulty - Сложность (easy, medium, hard)
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByLessonIdAndDifficulty(lessonId, difficulty, options = {}) {
        try {
            return await this.findByCondition(
                {
                    lessonId,
                    difficulty
                },
                {
                    order: [['id', 'ASC']],
                    ...options
                }
            );
        } catch (error) {
            console.error('Error finding assignments by difficulty:', error);
            throw error;
        }
    }

    /**
     * Получить задания с максимальным количеством баллов
     * @param {number} lessonId - ID урока
     * @param {number} minScore - Минимальное количество баллов
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByLessonIdAndMinScore(lessonId, minScore, options = {}) {
        try {
            return await this.findByCondition(
                {
                    lessonId,
                    maxScore: { [require('sequelize').Op.gte]: minScore }
                },
                {
                    order: [['maxScore', 'DESC']],
                    ...options
                }
            );
        } catch (error) {
            console.error('Error finding assignments by min score:', error);
            throw error;
        }
    }

    /**
     * Получить количество заданий в уроке
     * @param {number} lessonId - ID урока
     * @returns {Promise<number>}
     */
    async countByLessonId(lessonId) {
        try {
            return await this.count({ lessonId });
        } catch (error) {
            console.error('Error counting assignments by lesson ID:', error);
            throw error;
        }
    }

    /**
     * Получить задания с пагинацией
     * @param {number} lessonId - ID урока
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>}
     */
    async findPaginatedByLessonId(lessonId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await this.model.findAndCountAll({
                where: { lessonId },
                include: [{
                    model: AssignmentQuestion,
                    as: 'questions',
                    attributes: ['id']
                }],
                order: [['id', 'ASC']],
                limit,
                offset
            });

            return {
                assignments: rows,
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(count / limit),
                hasPrevPage: page > 1
            };
        } catch (error) {
            console.error('Error finding paginated assignments:', error);
            throw error;
        }
    }

    /**
     * Получить статистику по заданиям урока
     * @param {number} lessonId - ID урока
     * @returns {Promise<Object>}
     */
    async getLessonAssignmentsStats(lessonId) {
        try {
            const assignments = await this.findByLessonId(lessonId);

            const stats = {
                totalAssignments: assignments.length,
                totalMaxScore: 0,
                difficulties: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                },
                totalQuestions: 0,
                assignmentsWithFiles: 0
            };

            // Получаем детальную информацию для каждого задания
            for (const assignment of assignments) {
                stats.totalMaxScore += assignment.maxScore;
                stats.difficulties[assignment.difficulty]++;

                const assignmentWithDetails = await this.findByIdWithDetails(assignment.id);
                if (assignmentWithDetails) {
                    stats.totalQuestions += assignmentWithDetails.questions.length;
                    if (assignmentWithDetails.files.length > 0) {
                        stats.assignmentsWithFiles++;
                    }
                }
            }

            stats.averageMaxScore = stats.totalAssignments > 0
                ? Math.round(stats.totalMaxScore / stats.totalAssignments)
                : 0;

            return stats;
        } catch (error) {
            console.error('Error getting lesson assignments stats:', error);
            throw error;
        }
    }

    /**
     * Получить следующее задание в уроке
     * @param {number} lessonId - ID урока
     * @param {number} currentAssignmentId - Текущее ID задания
     * @returns {Promise<Object|null>}
     */
    async findNextAssignment(lessonId, currentAssignmentId) {
        try {
            return await this.model.findOne({
                where: {
                    lessonId,
                    id: { [require('sequelize').Op.gt]: currentAssignmentId }
                },
                order: [['id', 'ASC']],
                limit: 1
            });
        } catch (error) {
            console.error('Error finding next assignment:', error);
            throw error;
        }
    }

    /**
     * Получить предыдущее задание в уроке
     * @param {number} lessonId - ID урока
     * @param {number} currentAssignmentId - Текущее ID задания
     * @returns {Promise<Object|null>}
     */
    async findPreviousAssignment(lessonId, currentAssignmentId) {
        try {
            return await this.model.findOne({
                where: {
                    lessonId,
                    id: { [require('sequelize').Op.lt]: currentAssignmentId }
                },
                order: [['id', 'DESC']],
                limit: 1
            });
        } catch (error) {
            console.error('Error finding previous assignment:', error);
            throw error;
        }
    }

    /**
     * Поиск заданий по названию
     * @param {string} title - Название задания
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
            console.error('Error finding assignments by title:', error);
            throw error;
        }
    }

    /**
     * Поиск заданий по описанию
     * @param {string} description - Описание задания
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByDescription(description, options = {}) {
        try {
            return await this.findByCondition(
                { description: { [require('sequelize').Op.iLike]: `%${description}%` } },
                options
            );
        } catch (error) {
            console.error('Error finding assignments by description:', error);
            throw error;
        }
    }

    /**
     * Получить задания с истекшим сроком выполнения
     * @param {Date} date - Дата для проверки
     * @returns {Promise<Array>}
     */
    async findExpiredAssignments(date = new Date()) {
        try {
            return await this.findByCondition({
                deadline: {
                    [require('sequelize').Op.lt]: date
                }
            });
        } catch (error) {
            console.error('Error finding expired assignments:', error);
            throw error;
        }
    }

    /**
     * Получить задания по курсу (через уроки и модули)
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCourseId(courseId, options = {}) {
        try {
            const { Lesson, Module } = require('../models');

            return await this.findAll({
                include: [{
                    model: Lesson,
                    as: 'lesson',
                    include: [{
                        model: Module,
                        as: 'module',
                        where: { courseId },
                        required: true
                    }]
                }],
                order: [
                    [{ model: Lesson, as: 'lesson' }, 'moduleId', 'ASC'],
                    ['lessonId', 'ASC'],
                    ['id', 'ASC']
                ],
                ...options
            });
        } catch (error) {
            console.error('Error finding assignments by course ID:', error);
            throw error;
        }
    }
}

module.exports = LessonAssignmentRepository;