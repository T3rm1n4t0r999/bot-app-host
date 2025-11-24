const BaseRepository = require('./baseRepository');
const StudentProgress = require('../models/studentProgress');
const logger = require("../logger/logger");

class StudentProgressRepository extends BaseRepository {
    constructor() {
        super(StudentProgress);
    }

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