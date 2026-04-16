const { createClient } = require('redis');
const logger = require('../logger/logger');
const e = require("express");
class RedisService {
    constructor() {
        this.client = null;
        // Сколько хранить состояние незавершенного задания (по умолчанию 24 часа)
        this.TTL = 24 * 60 * 60; // 24 часа
        this.ENTITY_TYPES = {
            TASK : 'lesson_task',
            HOMEWORK : 'homework',
        }
    }

    async connect() {
        this.client = createClient({
            url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => console.log('Redis Client Error', err));
        await this.client.connect();
        logger.info('Redis Client Connected.');
    }

    // Ключи для хранения
    getUserQuestionKey(userId, questionId, entityType =  this.ENTITY_TYPES.TASK) {
        return `${entityType}:user:${userId}:question:${questionId}`;
    }

    getTaskProgressKey(userId, entityId, entityType =  this.ENTITY_TYPES.TASK) {
        return `${entityType}:user:${userId}:task:${entityId}:progress`;
    }

    getUserTextKey(userId, questionId, entityType =  this.ENTITY_TYPES.TASK) {
        return `${entityType}:user:${userId}:question:${questionId}:text`;
    }

    getAwaitingTextKey(userId, entityType =  this.ENTITY_TYPES.TASK) {
        // Храним текущий вопрос, для которого ожидаем текстовый ответ
        return `${entityType}:user:${userId}:await_text`;
    }

    // Управление TTL
    async setWithTTL(key, value) {
        await this.client.set(key, value);
        await this.client.expire(key, this.TTL);
    }

    // Прогресс задания
    async saveTaskProgress(userId, entityId, questionIds, currentIndex = 0, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getTaskProgressKey(userId, entityId, entityType);
        const progress = {
            questionIds,
            currentIndex,
            startedAt: new Date().toISOString(),
            entityType,
        };
        await this.setWithTTL(key, JSON.stringify(progress));
    }

    async getTaskProgress(userId, entityId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getTaskProgressKey(userId, entityId, entityType);
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async updateCurrentQuestion(userId, entityId, currentIndex, entityType = this.ENTITY_TYPES.TASK) {
        const progress = await this.getTaskProgress(userId, entityId, entityType);
        if (progress) {
            progress.currentIndex = currentIndex;
            const key = this.getTaskProgressKey(userId, entityId);
            await this.setWithTTL(key, JSON.stringify(progress));
        }
    }

    // В RedisService добавьте методы для работы с ключами
    async toggleUserOption(userId, questionId, optionKey, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        const isMember = await this.client.sIsMember(key, optionKey);

        if (isMember) {
            await this.client.sRem(key, optionKey);
        } else {
            await this.client.sAdd(key, optionKey);
        }

        await this.client.expire(key, this.TTL);
        return !isMember;
    }

    async setUserOption(userId, questionId, optionKey, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        await this.client.del(key);
        await this.client.sAdd(key, optionKey);
        await this.client.expire(key, this.TTL);
    }

    async getUserSelectedOptions(userId, questionId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        return await this.client.sMembers(key);
    }

    async getUserSelectedOption(userId, questionId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        const members = await this.client.sMembers(key);
        return members.length > 0 ? members[0] : null;
    }

    // Ответы на вопросы (text/code)
    async setUserTextAnswer(userId, questionId, text, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserTextKey(userId, questionId, entityType);
        await this.client.set(key, text);
        await this.client.expire(key, this.TTL);
    }

    async getUserTextAnswer(userId, questionId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserTextKey(userId, questionId, entityType);
        return await this.client.get(key);
    }

    async clearUserTextAnswer(userId, questionId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserTextKey(userId, questionId, entityType);
        await this.client.del(key);
    }

    // Ожидание текстового ответа (маркер состояния)
    async setAwaitingTextAnswer(userId, entityId, questionId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getAwaitingTextKey(userId, entityType);
        await this.setWithTTL(key, JSON.stringify({
            entityId: entityId,
            questionId,
            entityType
        }));
    }

    async getAwaitingTextAnswer(userId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getAwaitingTextKey(userId, entityType);
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async clearAwaitingTextAnswer(userId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getAwaitingTextKey(userId, entityType);
        await this.client.del(key);
    }

    // Очистка
    async clearUserQuestionState(userId, questionId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        await this.client.del(key);
    }

    async clearTaskProgress(userId, entityId, entityType = this.ENTITY_TYPES.TASK) {
        const key = this.getTaskProgressKey(userId, entityId, entityType);
        console.log("progress in redis was deleted");
        await this.client.del(key);
    }

    // Получение всех ответов для задания (без знания типов)
    async getUserTaskAnswers(userId, entityId, questionIds, entityType = this.ENTITY_TYPES.TASK) {
        const answers = {};
        for (const questionId of questionIds) {
            // Для choice типов ответы хранятся в set, для текстовых — в строке
            const selected = await this.getUserSelectedOptions(userId, questionId, entityType);
            if (selected && selected.length > 0) {
                answers[questionId] = selected;
                continue;
            }
            const single = await this.getUserSelectedOption(userId, questionId, entityType);
            if (single !== null && single !== undefined) {
                answers[questionId] = single;
                continue;
            }
            const text = await this.getUserTextAnswer(userId, questionId, entityType);
            if (text) {
                answers[questionId] = text;
            }
            // Дополнить для file, code
        }
        return answers;
    }
}

module.exports = new RedisService();
