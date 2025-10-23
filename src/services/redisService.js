const { createClient } = require('redis');

class RedisService {
    constructor() {
        this.client = null;
        this.TTL = 24 * 60 * 60; // 24 часа
    }

    async connect() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => console.log('Redis Client Error', err));
        await this.client.connect();
        console.log('Connected to Redis');
    }

    // Ключи для хранения
    getUserQuestionKey(userId, questionId) {
        return `user:${userId}:question:${questionId}`;
    }

    getTaskProgressKey(userId, taskId) {
        return `user:${userId}:task:${taskId}:progress`;
    }

    // Управление TTL
    async setWithTTL(key, value) {
        await this.client.set(key, value);
        await this.client.expire(key, this.TTL);
    }

    // Прогресс задания
    async saveTaskProgress(userId, taskId, questionIds, currentIndex = 0) {
        const key = this.getTaskProgressKey(userId, taskId);
        const progress = {
            questionIds,
            currentIndex,
            startedAt: new Date().toISOString()
        };
        await this.setWithTTL(key, JSON.stringify(progress));
    }

    async getTaskProgress(userId, taskId) {
        const key = this.getTaskProgressKey(userId, taskId);
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async updateCurrentQuestion(userId, taskId, currentIndex) {
        const progress = await this.getTaskProgress(userId, taskId);
        if (progress) {
            progress.currentIndex = currentIndex;
            const key = this.getTaskProgressKey(userId, taskId);
            await this.setWithTTL(key, JSON.stringify(progress));
        }
    }

    // Ответы на вопросы
    async toggleUserOption(userId, questionId, optionIndex) {
        const key = this.getUserQuestionKey(userId, questionId);
        const isMember = await this.client.sIsMember(key, optionIndex);

        if (isMember) {
            await this.client.sRem(key, optionIndex);
        } else {
            await this.client.sAdd(key, optionIndex);
        }

        await this.client.expire(key, this.TTL);
        return !isMember;
    }

    async setUserOption(userId, questionId, optionIndex) {
        const key = this.getUserQuestionKey(userId, questionId);
        await this.client.del(key);
        await this.client.sAdd(key, optionIndex);
        await this.client.expire(key, this.TTL);
    }

    async getUserSelectedOptions(userId, questionId) {
        const key = this.getUserQuestionKey(userId, questionId);
        const members = await this.client.sMembers(key);
        return members.map(Number).sort((a, b) => a - b);
    }

    async getUserSelectedOption(userId, questionId) {
        const key = this.getUserQuestionKey(userId, questionId);
        const members = await this.client.sMembers(key);
        return members.length > 0 ? Number(members[0]) : null;
    }

    // Очистка
    async clearUserQuestionState(userId, questionId) {
        const key = this.getUserQuestionKey(userId, questionId);
        await this.client.del(key);
    }

    async clearTaskProgress(userId, taskId) {
        const key = this.getTaskProgressKey(userId, taskId);
        await this.client.del(key);
    }

    // Получение всех ответов для задания
    async getUserTaskAnswers(userId, taskId) {
        const progress = await this.getTaskProgress(userId, taskId);
        if (!progress) return null;

        const answers = {};
        for (const questionId of progress.questionIds) {
            const question = await lessonService.getTaskQuestionById(questionId);
            if (question.questionType === "multiple_choice") {
                answers[questionId] = await this.getUserSelectedOptions(userId, questionId);
            } else {
                answers[questionId] = await this.getUserSelectedOption(userId, questionId);
            }
        }

        return answers;
    }
}

module.exports = new RedisService();