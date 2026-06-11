const QuestionRepository = require("../repository/QuestionRepository");
const Logger = require("../logger/Logger");
const logger = require("../logger/Logger");
const {use} = require("express/lib/application");
const {resolveModelType} = require("../utils/ModelResolver");
class QuestionService {
    constructor(){
        this.questionRepo = new QuestionRepository();
    }

    async getQuestionByIdWithFiles(questionId) {
        try {
            return await this.questionRepo.findByIdWithFiles(questionId);
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }


    async getMaxScore(entityType, entityId) {
        try {
            const Model = resolveModelType(entityType); // возвращает модель: Homework, Exam, LessonTask
            const entity = await Model.findByPk(entityId, {
                attributes: ['maxScore']
            });
            return entity ? entity.maxScore : 0;
        } catch (e) {
            Logger.error(e);
            return 0;
        }
    }

    /**
     * Получить вопрос по сущности
     * @param entityId
     * @param entityType
     * @returns {Promise<Array>}
     */
    async getQuestionsByEntity(entityId, entityType) {
        try {
            return await this.questionRepo.findAllQuestions(entityId, entityType);
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    /**
     * Получить вопрос по номеру
     * @param questionId
     * @returns {Promise<Object|null>}
     */
    async getQuestionById(questionId) {
        try {
            return await this.questionRepo.findById(questionId);
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    /**
     * Вычислить результат прохождения теста
     * @param questionIds
     * @param userAnswers
     * @returns {Promise<{earnedPoints: number, maxPoints: number}>}
     */
    async calculateResults(questionIds, userAnswers) {
        try {
            const questions = await this.getQuestionsByIds(questionIds);
            let earnedPoints = 0;
            let maxPoints = 0;

            for (const question of questions) {
                const qPoints = question.points || 0;
                maxPoints += qPoints;
                const userAnswer = userAnswers[question.id];

                if (await this.isAnswerCorrect(question, userAnswer)) {
                    earnedPoints += qPoints;
                }
            }

            return {earnedPoints, maxPoints};
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    /**
     * Получить вопросы по номерам
     * @param questionIds
     * @returns {Promise<Array>}
     */
    async getQuestionsByIds(questionIds) {
        try {
            return await this.questionRepo.findByIds(questionIds);
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    /**
     * Проверка корректности ответа на вопрос
     * @param question
     * @param userAnswer
     * @returns {Promise<this is string[]|*|boolean>}
     */
    async isAnswerCorrect(question, userAnswer) {
        if (!question || userAnswer === null || userAnswer === undefined) {
            return false;
        }
        const questionTextAnswers = question.options;
        const correctAnswers = question.correctAnswers;

        switch (question.questionType) {
            case 'single_choice':
                return await this.checkSingleChoice(userAnswer, correctAnswers);

            case 'multiple_choice':
                return await this.checkMultipleChoice(userAnswer, correctAnswers);

            case 'text':
                return await this.checkTextAnswer(userAnswer, questionTextAnswers);
            case 'free_text':
                return false;
            default:
                Logger.warn(`Unknown question type: ${question.questionType}`);
                return false;
        }
    }

    /**
     * Проверка single_choice ответа
     */
    async checkSingleChoice(userAnswer, correctAnswers) {
        if (!userAnswer || correctAnswers.length === 0) return false;

        const userAnswerStr = userAnswer.toString().trim();

        return correctAnswers.some(correct =>
            correct.toString().trim() === userAnswerStr
        );
    }

    /**
     * Проверка multiple_choice ответа
     */
    async checkMultipleChoice(userAnswer, correctAnswers) {
        if (!userAnswer || !Array.isArray(userAnswer) || correctAnswers.length === 0) {
            return false;
        }

        return await this.areArraysEqual(correctAnswers, userAnswer);
    }

    async areArraysEqual(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
        if (arr1.length !== arr2.length) return false;

        const a = arr1.map(String).sort();
        const b = arr2.map(String).sort();

        return a.every((val, idx) => val === b[idx]);
    }

    /**
     * Проверка текстового ответа (text/code)
     */
    async checkTextAnswer(userAnswer, correctAnswers) {
        if (!userAnswer || correctAnswers.length === 0) return false;
        const userAnswerStr = userAnswer.toString().trim().toLowerCase();

        return correctAnswers.some(correct => {

            let correctStr;
            if (correct && typeof correct.text === 'string') {
                correctStr = correct.text;
            }

            correctStr = correctStr.trim().toLowerCase();

            if (userAnswerStr === correctStr) {
                return true;
            }


            const normalizedUser = userAnswerStr.replace(/\s+/g, ' ');
            const normalizedCorrect = correctStr.replace(/\s+/g, ' ');
            return normalizedUser === normalizedCorrect;
        });
    }
}

module.exports = QuestionService;