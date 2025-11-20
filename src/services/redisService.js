const { createClient } = require('redis');
const logger = require('../logger/logger');
class RedisService {
    constructor() {
        this.client = null;
        // Сколько хранить состояние незавершенного задания (по умолчанию 24 часа)
        this.TTL = 24 * 60 * 60; // 24 часа
    }

    async connect() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => console.log('Redis Client Error', err));
        await this.client.connect();
        logger.info('Redis Client Connected.');
    }

    // Ключи для хранения
    getUserQuestionKey(userId, questionId) {
        return `user:${userId}:question:${questionId}`;
    }

    getTaskProgressKey(userId, taskId) {
        return `user:${userId}:task:${taskId}:progress`;
    }

    getUserTextKey(userId, questionId) {
        return `user:${userId}:question:${questionId}:text`;
    }

    getAwaitingTextKey(userId) {
        // Храним текущий вопрос, для которого ожидаем текстовый ответ
        return `user:${userId}:await_text`;
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

    // В RedisService добавьте методы для работы с ключами
    async toggleUserOption(userId, questionId, optionKey) {
        const key = this.getUserQuestionKey(userId, questionId);
        const isMember = await this.client.sIsMember(key, optionKey);

        if (isMember) {
            await this.client.sRem(key, optionKey);
        } else {
            await this.client.sAdd(key, optionKey);
        }

        await this.client.expire(key, this.TTL);
        return !isMember;
    }

    async setUserOption(userId, questionId, optionKey) {
        const key = this.getUserQuestionKey(userId, questionId);
        await this.client.del(key);
        await this.client.sAdd(key, optionKey);
        await this.client.expire(key, this.TTL);
    }

    async getUserSelectedOptions(userId, questionId) {
        const key = this.getUserQuestionKey(userId, questionId);
        return await this.client.sMembers(key);
    }

    async getUserSelectedOption(userId, questionId) {
        const key = this.getUserQuestionKey(userId, questionId);
        const members = await this.client.sMembers(key);
        return members.length > 0 ? members[0] : null;
    }

    // Ответы на вопросы (text/code)
    async setUserTextAnswer(userId, questionId, text) {
        const key = this.getUserTextKey(userId, questionId);
        await this.client.set(key, text);
        await this.client.expire(key, this.TTL);
    }

    async getUserTextAnswer(userId, questionId) {
        const key = this.getUserTextKey(userId, questionId);
        return await this.client.get(key);
    }

    async clearUserTextAnswer(userId, questionId) {
        const key = this.getUserTextKey(userId, questionId);
        await this.client.del(key);
    }

    // Ожидание текстового ответа (маркер состояния)
    async setAwaitingTextAnswer(userId, taskId, questionId) {
        const key = this.getAwaitingTextKey(userId);
        await this.setWithTTL(key, JSON.stringify({ taskId, questionId }));
    }

    async getAwaitingTextAnswer(userId) {
        const key = this.getAwaitingTextKey(userId);
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async clearAwaitingTextAnswer(userId) {
        const key = this.getAwaitingTextKey(userId);
        await this.client.del(key);
    }

    // Очистка
    async clearUserQuestionState(userId, questionId) {
        const key = this.getUserQuestionKey(userId, questionId);
        await this.client.del(key);
    }

    async clearTaskProgress(userId, taskId) {
        const key = this.getTaskProgressKey(userId, taskId);
        console.log("progress in redis was deleted");
        await this.client.del(key);
    }

    // Получение всех ответов для задания (без знания типов)
    async getUserTaskAnswers(userId, taskId, questionIds) {
        const answers = {};
        for (const questionId of questionIds) {
            // Для choice типов ответы хранятся в set, для текстовых — в строке
            const selected = await this.getUserSelectedOptions(userId, questionId);
            if (selected && selected.length > 0) {
                answers[questionId] = selected;
                continue;
            }
            const single = await this.getUserSelectedOption(userId, questionId);
            if (single !== null && single !== undefined) {
                answers[questionId] = single;
                continue;
            }
            const text = await this.getUserTextAnswer(userId, questionId);
            if (text) {
                answers[questionId] = text;
            }
        }
        return answers;
    }
}

module.exports = new RedisService();