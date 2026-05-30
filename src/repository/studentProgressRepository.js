const BaseRepository = require('./baseRepository');
const StudentProgress = require('../models/studentProgress');
const logger = require("../logger/logger");
const {sequelize} = require("../database/db");
const {Op} = require("sequelize");
const {resolveModelType} = require("../utils/modelResolver");
const {Question} = require("../models");


class StudentProgressRepository extends BaseRepository {
    constructor() {
        super(StudentProgress);
    }

    async countStudentProgressByTaskIds(studentId, taskIds) {
        const result = await StudentProgress.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('progressable_id'))), 'uniqueCount']
            ],
            where: {
                student_id: studentId,
                progressable_type: 'lesson_task',
                progressable_id: { [Op.in]: taskIds },
                checked: true
            },
            raw: true
        });
        return parseInt(result.uniqueCount) || 0;
    }

    async findByIdWithTask(attemptId) {
        const progress = await StudentProgress.findByPk(attemptId);
        if (!progress) return null;

        const model = resolveModelType(progress.progressableType);
        if (model) {
            progress.dataValues.task = await model.findByPk(progress.progressableId, {
                include: [{
                    model: Question,
                    as: 'questions',
                    required: false,
                }],
            });
        }
        return progress;
    }

    async getBestAttempts(studentId) {
        const attempts = await this.findAll({
            where: { studentId: studentId, },
            order: [['points', 'DESC'], ['checked', 'DESC'], ['updated_at', 'DESC']],
            raw: true,
        });

        const bestByTask = {};
        for (const a of attempts) {
            const key = `${a.progressableType}_${a.progressableId}`;
            if (!bestByTask[key]) {
                let title = 'Без названия';
                try {
                    const model = resolveModelType(a.progressableType);
                    if (model) {
                        const entity = await model.findByPk(a.progressableId, { attributes: ['title'] });
                        if (entity) title = entity.title;
                    }
                } catch (e) { /* игнорируем */ }
                bestByTask[key] = { ...a, title };
            }
        }
        return Object.values(bestByTask);
    }

    /**
     * Найти лучший результат
     * @param studentId
     * @param progressableType
     * @param progressableId
     * @returns {Promise<Object|null>}
     */
    async findBestResult(studentId, progressableType, progressableId) {
        try {
            return await this.findOne({
                where: {
                    studentId: studentId,
                    progressableType: progressableType,
                    progressableId: progressableId
                },
                order: [['points', 'DESC']]
            });
        } catch (e) {
            console.error('Error in findBestResult:', e);
            throw e;
        }
    }

    async findLastResult(studentId, progressableType, progressableId) {
        try {
            return await this.findOne({
                where: {
                    studentId: studentId,
                    progressableType: progressableType,
                    progressableId: progressableId
                },
                order: [['attempts', 'DESC']]
            });
        } catch (e) {
            console.error('Error in findBestResult:', e);
            throw e;
        }
    }

    /**
     * Сохранить результат студента
     * @param progressData
     * @param options
     * @returns {Promise<Object>}
     */
    async saveStudentResults(progressData, options = {}){
        try {
            if (!progressData.attempt && progressData.studentId && progressData.progressableType && progressData.progressableId) {
                progressData.attempt = await this.getNextAttempt(
                    progressData.studentId,
                    progressData.progressableType,
                    progressData.progressableId
                );
            }
            return await this.create(progressData, options);
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    /**
     * Получить следующую попытку
     * @param studentId
     * @param progressableType
     * @param progressableId
     * @returns {Promise<number|*|number>}
     */
    async getNextAttempt(studentId, progressableType, progressableId){
        try {
            const lastAttempt = await StudentProgress.max('attempt', {
                where: {
                    studentId: studentId,
                    progressableType: progressableType,
                    progressableId: progressableId
                }
            });
            return lastAttempt ? lastAttempt + 1 : 1;
        } catch (error) {
            console.error('Error getting next attempt:', error);
            return 1;
        }
    }


}

module.exports = StudentProgressRepository;