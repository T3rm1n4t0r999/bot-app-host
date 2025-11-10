const BaseRepository = require('./baseRepository');
const StudentProgress = require('../models/studentProgress');

class StudentProgressRepository extends BaseRepository {
    constructor() {
        super(StudentProgress);
    }

    /**
     * Найти или создать прогресс студента по заданию
     * @param {number} studentId - ID студента
     * @param {number} taskId - ID задания
     * @param {Object} defaults - Значения по умолчанию
     * @returns {Promise<Object>}
     */
    async findOrCreateProgress(studentId, taskId, defaults = {}) {
        try {
            const [progress, created] = await this.model.findOrCreate({
                where: { studentId, taskId },
                defaults: {
                    status: 'in_progress',
                    progress: 0,
                    startedAt: new Date(),
                    points:0,
                    ...defaults
                }
            });
            return { progress, created };
        } catch (error) {
            console.error('Error finding or creating student progress:', error);
            throw error;
        }
    }

    /**
     * Найти прогресс студента по заданию
     * @param {number} studentId - ID студента
     * @param {number} taskId - ID задания
     * @returns {Promise<Object|null>}
     */
    async findByStudentAndTask(studentId, taskId) {
        try {
            return await this.findOne({ studentId, taskId });
        } catch (error) {
            console.error('Error finding student progress by student and task:', error);
            throw error;
        }
    }

    /**
     * Обновить прогресс студента
     * @param {number} studentId - ID студента
     * @param {number} taskId - ID задания
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise<Object|null>}
     */
    async updateProgress(studentId, taskId, updateData) {
        try {
            const progress = await this.findByStudentAndTask(studentId, taskId);
            if (!progress) {
                return null;
            }
            return await progress.update(updateData);
        } catch (error) {
            console.error('Error updating student progress:', error);
            throw error;
        }
    }

    /**
     * Получить все завершенные задания студента
     * @param {number} studentId - ID студента
     * @returns {Promise<Array>}
     */
    async getCompletedTasks(studentId) {
        try {
            return await this.findByCondition({
                studentId,
                status: ['completed', 'graded']
            });
        } catch (error) {
            console.error('Error getting completed tasks:', error);
            throw error;
        }
    }

    /**
     * Получить прогресс по курсу/модулю
     * @param {number} studentId - ID студента
     * @param {Array} taskIds - Массив ID заданий
     * @returns {Promise<Object>}
     */
    async getCourseProgress(studentId, taskIds) {
        try {
            const progresses = await this.findByCondition({
                studentId,
                taskId: taskIds
            });

            const total = taskIds.length;
            const completed = progresses.filter(p =>
                p.status === 'completed' || p.status === 'graded'
            ).length;
            const inProgress = progresses.filter(p =>
                p.status === 'in_progress'
            ).length;
            const notStarted = total - completed - inProgress;

            return {
                total,
                completed,
                inProgress,
                notStarted,
                completionRate: Math.round((completed / total) * 100),
                progresses
            };
        } catch (error) {
            console.error('Error getting course progress:', error);
            throw error;
        }
    }

    /**
     * Получить статистику по заданиям
     * @param {number} studentId - ID студента
     * @returns {Promise<Object>}
     */
    async getStudentStats(studentId) {
        try {
            const allProgress = await this.findByCondition({ studentId });

            const total = allProgress.length;
            const completed = allProgress.filter(p =>
                p.status === 'completed' || p.status === 'graded'
            ).length;
            const averageGrade = completed > 0
                ? allProgress.reduce((sum, p) => sum + (p.grade || 0), 0) / completed
                : 0;

            return {
                totalTasks: total,
                completedTasks: completed,
                inProgressTasks: allProgress.filter(p => p.status === 'in_progress').length,
                averageGrade: Math.round(averageGrade),
                completionRate: Math.round((completed / total) * 100)
            };
        } catch (error) {
            console.error('Error getting student stats:', error);
            throw error;
        }
    }

    /**
     * Обновить ответы студента
     * @param {number} studentId - ID студента
     * @param {number} taskId - ID задания
     * @param {Object} answers - Ответы студента
     * @returns {Promise<Object|null>}
     */
    async updateAnswers(studentId, taskId, answers) {
        try {
            return await this.updateProgress(studentId, taskId, { answers });
        } catch (error) {
            console.error('Error updating student answers:', error);
            throw error;
        }
    }

    /**
     * Завершить задание
     * @param {number} studentId - ID студента
     * @param {number} taskId - ID задания
     * @param {Object} results - Результаты выполнения
     * @returns {Promise<Object|null>}
     */
    async completeTask(studentId, taskId, results) {
        try {
            const { points, answers } = results;

            return await this.updateProgress(studentId, taskId, {
                status: 'completed',
                answers: answers,
                points: points,
                progress: 100,
                completedAt: new Date()
            });
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    }

    /**
     * Получить историю выполнения заданий
     * @param {number} studentId - ID студента
     * @param {number} limit - Лимит записей
     * @returns {Promise<Array>}
     */
    async getTaskHistory(studentId, limit = 10) {
        try {
            return await this.findByCondition(
                { studentId },
                {
                    order: [['completedAt', 'DESC']],
                    limit,
                    include: ['Task'] // предполагая, что есть ассоциация с Task
                }
            );
        } catch (error) {
            console.error('Error getting task history:', error);
            throw error;
        }
    }
}

module.exports = StudentProgressRepository;