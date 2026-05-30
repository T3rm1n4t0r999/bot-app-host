const StudentRepository = require("../repository/studentRepository");
const StudentProgressRepository = require("../repository/studentProgressRepository");
const { sequelize } = require('../database/db');
const logger = require("../logger/logger");
const CourseService = require("../services/courseService");
const GroupRepository = require("../repository/groupRepository");
const {NotFoundError} = require("../utils/errors");
const HomeworkRepository = require("../repository/homeworkRepository");
const LessonTaskRepository = require("../repository/lessonTaskRepository");
const ExamRepository = require("../repository/examRepository");
const {Logger} = require("sequelize/lib/utils/logger");

class StudentService {
    constructor() {
        this.studentRepository = new StudentRepository();
        this.courseService = new CourseService();
        this.groupRepo =  new GroupRepository();
        this.studentProgressRepo = new StudentProgressRepository();
        this.homeworkRepo = new HomeworkRepository();
        this.lessonTaskRepository = new LessonTaskRepository();
        this.examRepository = new ExamRepository();
    }

    async hasCompletedLesson(studentId, lessonId) {
        const tasks = await this.lessonTaskRepository.findByLessonId(lessonId);
        if (tasks.length === 0) return false;
        const taskIds = tasks.map(t => t.id);
        const completed = await this.studentProgressRepo.countStudentProgressByTaskIds(studentId, taskIds);
        return completed === taskIds.length;
    }

    async hasCompletedModule(studentId, moduleId) {
        const tasks = await this.lessonTaskRepository.findByModuleId(moduleId);
        if (tasks.length === 0) return false;
        const taskIds = tasks.map(t => t.id);
        const completed = await this.studentProgressRepo.countStudentProgressByTaskIds(studentId, taskIds);
        return completed === taskIds.length;
    }


    async assignHomeworkIfReady(studentId, lessonId) {
        const ready = await this.hasCompletedLesson(studentId, lessonId);
        if (!ready) return null;

        const homework = await this.homeworkRepo.getActiveByLesson(lessonId);
        if (!homework) return null;

        const [sh] = await this.homeworkRepo.assignToStudent({
            studentId: studentId,
            homeworkId: homework.id,
            organizationId: homework.organization_id,
            grantedBy: 'system',
            grantedAt: new Date()
        });
        return sh;
    }

    async assignExamIfReady(studentId, moduleId) {
        const ready = await this.hasCompletedModule(studentId, moduleId);
        if (!ready) return null;

        const exam = await this.examRepository.getActiveByModule(moduleId);
        if (!exam) return null;

        const [se] = await this.examRepository.assignToStudent({
            studentId: studentId,
            examId: exam.id,
            organizationId: exam.organization_id,
            grantedBy: 'system',
            grantedAt: new Date()
        });
        return se;
    }

    /**
     * Регистрация студента
     * @param {Object} userData - Данные пользователя
     * @param organizationId
     * @returns {Promise<Object>}
     */
    async registerStudent(userData, organizationId) {
        const transaction = await sequelize.transaction();
        try {
            const telegramId = userData.id.toString();

            let student = await this.studentRepository.findByTelegramId(telegramId);
            if (!student) {
                const studentData = {
                    telegramId: telegramId,
                    firstname: userData.first_name || '',
                    lastname: userData.last_name || '',
                    username: userData.username || '',
                    organization_id: organizationId,
                    role: 'student'
                };
                
                student = await this.studentRepository.create(studentData, { transaction });
            }
            
            await transaction.commit();
            return student;
        } catch (error) {
            await transaction.rollback();
            logger.error("Error while registering student",error);
            throw error;
        }
    }

    async getGroupByCode(code) {
        try {
            return await this.groupRepo.findByCode(code);
        } catch (e) {
            throw e;
        }
    }

    async assignAutoCourses(student) {
        try {
            const autoAssignedCourses = await this.courseService.getAutoAssignedCourses(student);
            return await this.courseService.assignCourses(student, autoAssignedCourses);
        } catch (e) {
            throw e;
        }
    }

    async assignGroupById(student, groupId) {
        await this.studentRepository.assignGroup(student.id, groupId);
        const groupAssignedCourse = await this.courseService.getGroupAssignedCourses(groupId);
        return await this.courseService.assignCourses(student, groupAssignedCourse);
    }


    async isUserRegistered(telegramId) {
        try {
            return await this.studentRepository.findByTelegramId(telegramId);
        } catch (e) {
            logger.error("Error while registering student",e);
            throw e;
        }
    }

    /**
     * Получить таблицу лидеров
     * @param limit
     * @returns {Promise<Array>}
     */
    async getLeaderboard(limit = 10){
        try {
            return await this.studentRepository.getStudentsByScore(limit);
        } catch (e) {
            logger.error("Error while getting leaderboard",e);
        }
    }

    /**
     * Получение профиля студента
     * @param {string} telegramId - Telegram ID студента
     * @returns {Promise<Object|null>}
     */
    async getStudentProfile(telegramId) {
        try {
            return await this.studentRepository.findByTelegramId(telegramId);
        } catch (error) {
            logger.error('Error while getting student profile', error);
            throw error;
        }
    }

    /**
     * Добавить баллы студенту
     * @param studentId
     * @param points
     * @returns {Promise<void>}
     */
    async addPoints(studentId, points) {
        const transaction = await sequelize.transaction();
        try {
            await this.studentRepository.addPoints(studentId, points, {transaction});
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error("Error while adding points to student",error);
            throw error;
        }
    }

    /**
     * Сохранить прогресс студента
     * @param progressData
     * @returns {Promise<Object>}
     */
    async saveStudentResults(progressData)  {
        const transaction = await sequelize.transaction();
        try{
            const newResult = await this.studentProgressRepo.saveStudentResults(progressData, {transaction});
            await transaction.commit();
            return newResult;
        } catch (e) {
            await transaction.rollback();
            logger.error(e);
            throw e;
        }
    }

    /**
     * Найти лучший результат студента
     * @param studentId
     * @param entityType
     * @param entityId
     * @returns {Promise<Object|null>}
     */
    async findBestResult(studentId, entityType, entityId){
        try {
            return await this.studentProgressRepo.findBestResult(studentId, entityType, entityId);
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async findLastResult(studentId, entityType, entityId){
        try {
            return await this.studentProgressRepo.findLastResult(studentId, entityType, entityId);
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getBestAttempts(studentId) {
        try{
            return await this.studentProgressRepo.getBestAttempts(studentId);
        }catch(e){
            logger.error(e);
            throw e;
        }
    }

    async getAttemptDetails(attemptId) {
        return await this.studentProgressRepo.findByIdWithTask(attemptId);
    }



}

module.exports = StudentService;