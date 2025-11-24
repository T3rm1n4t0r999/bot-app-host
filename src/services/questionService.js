const QuestionRepository = require("../repository/questionRepository");
const Logger = require("../logger/logger");
const logger = require("../logger/logger");
class QuestionService {
    constructor(){
        this.questionRepo = new QuestionRepository();
    }

    async getQuestionsByEntity(entityId, entityType) {
        try {
            return await this.questionRepo.findAllQuestions(entityId, entityType);
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    async getQuestionById(questionId) {
        try {
            return await this.questionRepo.findById(questionId);
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

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

    async getQuestionsByIds(questionIds) {
        try {
            return await this.questionRepo.findByIds(questionIds);
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    async isAnswerCorrect(question, userAnswer) {
        if (!question || userAnswer === null || userAnswer === undefined) {
            return false;
        }

        const correctAnswers = await this.normalizeCorrectAnswers(question.correctAnswers);

        switch (question.questionType) {
            case 'single_choice':
                return await this.checkSingleChoice(userAnswer, correctAnswers);

            case 'multiple_choice':
                return await this.checkMultipleChoice(userAnswer, correctAnswers);

            case 'text':
                return await this.checkTextAnswer(userAnswer, correctAnswers);

            default:
                Logger.warn(`Unknown question type: ${question.questionType}`);
                return false;
        }
    }

    /**
     * Нормализация correctAnswers к единому формату
     */
    async normalizeCorrectAnswers(correctAnswers) {
        if (!correctAnswers) return [];

        if (Array.isArray(correctAnswers)) {
            return correctAnswers;
        }

        if (typeof correctAnswers === 'string') {
            try {
                const parsed = JSON.parse(correctAnswers);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (error) {
                return [correctAnswers];
            }
        }

        return [correctAnswers];
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

        // Нормализуем userAnswer к массиву
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

        // Для multiple_choice важен порядок и точное совпадение
        const normalizedUserAnswers = userAnswers
            .map(answer => answer.toString().trim())
            .sort();

        const normalizedCorrectAnswers = correctAnswers
            .map(answer => answer.toString().trim())
            .sort();

        // Проверяем точное совпадение массивов
        if (normalizedUserAnswers.length !== normalizedCorrectAnswers.length) {
            return false;
        }

        return normalizedUserAnswers.every((answer, index) =>
            answer === normalizedCorrectAnswers[index]
        );
    }

    /**
     * Проверка текстового ответа (text/code)
     */
    async checkTextAnswer(userAnswer, correctAnswers) {
        if (!userAnswer || correctAnswers.length === 0) return false;

        const userAnswerStr = userAnswer.toString().trim().toLowerCase();

        return correctAnswers.some(correct => {
            const correctStr = correct.toString().trim().toLowerCase();

            // Точное совпадение
            if (userAnswerStr === correctStr) {
                return true;
            }

            // Совпадение без лишних пробелов
            const normalizedUser = userAnswerStr.replace(/\s+/g, ' ');
            const normalizedCorrect = correctStr.replace(/\s+/g, ' ');
            return normalizedUser === normalizedCorrect;
        });
    }
}

module.exports = QuestionService;