const { createClient } = require('redis');
const logger = require('../Logger/Logger');
const e = require("express");
class RedisService {
    constructor() {
        this.client = null;
        // Сколько хранить состояние незавершенного задания (по умолчанию 24 часа)
        this.TTL = 24 * 60 * 60; // 24 часа
        this.ENTITY_TYPES = {
            TASK : 'lesson_task',
            HOMEWORK : 'homework',
            EXAM : 'exam',
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
    getUserQuestionKey(userId, questionId, entityType) {
        return `${entityType}:user:${userId}:question:${questionId}`;
    }

    getTaskProgressKey(userId, entityId, entityType) {
        return `${entityType}:user:${userId}:task:${entityId}:progress`;
    }

    getUserTextKey(userId, questionId, entityType ) {
        return `${entityType}:user:${userId}:question:${questionId}:text`;
    }

    getAwaitingTextKey(userId, entityType ) {
        // Храним текущий вопрос, для которого ожидаем текстовый ответ
        return `${entityType}:user:${userId}:await_text`;
    }

    // Управление TTL
    async setWithTTL(key, value) {
        await this.client.set(key, value);
        await this.client.expire(key, this.TTL);
    }

    // Прогресс задания
    async saveTaskProgress(userId, entityId, questionIds, currentIndex = 0, entityType) {
        const key = this.getTaskProgressKey(userId, entityId, entityType);
        const progress = {
            questionIds,
            currentIndex,
            startedAt: new Date().toISOString(),
            entityType,
        };
        await this.setWithTTL(key, JSON.stringify(progress));
    }

    async getTaskProgress(userId, entityId, entityType ) {
        const key = this.getTaskProgressKey(userId, entityId, entityType);
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async updateCurrentQuestion(userId, entityId, currentIndex, entityType) {
        const progress = await this.getTaskProgress(userId, entityId, entityType);
        if (progress) {
            progress.currentIndex = currentIndex;
            const key = this.getTaskProgressKey(userId, entityId, entityType);
            await this.setWithTTL(key, JSON.stringify(progress));
        }
    }

    // В RedisService добавьте методы для работы с ключами
    async toggleUserOption(userId, questionId, optionKey, entityType) {
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

    async setUserOption(userId, questionId, optionKey, entityType) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        await this.client.del(key);
        await this.client.sAdd(key, optionKey);
        await this.client.expire(key, this.TTL);
    }

    async getUserSelectedOptions(userId, questionId, entityType) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        return await this.client.sMembers(key);
    }

    async getUserSelectedOption(userId, questionId, entityType ) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        const members = await this.client.sMembers(key);
        return members.length > 0 ? members[0] : null;
    }

    // Ответы на вопросы (text/code)
    async setUserTextAnswer(userId, questionId, text, entityType) {
        const key = this.getUserTextKey(userId, questionId, entityType);
        await this.client.set(key, text);
        await this.client.expire(key, this.TTL);
    }

    async getUserTextAnswer(userId, questionId, entityType) {
        const key = this.getUserTextKey(userId, questionId, entityType);
        return await this.client.get(key);
    }

    async clearUserTextAnswer(userId, questionId, entityType) {
        const key = this.getUserTextKey(userId, questionId, entityType);
        await this.client.del(key);
    }

    async setAwaitingTextAnswer(userId, entityId, questionId, entityType) {
        const key = this.getAwaitingTextKey(userId, entityType);
        await this.setWithTTL(key, JSON.stringify({
            entityId: entityId,
            questionId,
            entityType
        }));
    }

    async getAwaitingTextAnswer(userId) {
        for (const entityType of Object.values(this.ENTITY_TYPES)) {
            const key = this.getAwaitingTextKey(userId, entityType);
            const data = await this.client.get(key);
            if (data) {
                // Нашли! Возвращаем объект, внутри которого уже есть правильный entityType
                return JSON.parse(data);
            }
        }
        return null; // Не найдено ни в одном типе
    }

    async clearAwaitingTextAnswer(userId, entityType) {
        const key = this.getAwaitingTextKey(userId, entityType);
        await this.client.del(key);
    }

    // Очистка
    async clearUserQuestionState(userId, questionId, entityType) {
        const key = this.getUserQuestionKey(userId, questionId, entityType);
        await this.client.del(key);
    }

    async clearTaskProgress(userId, entityId, entityType) {
        const key = this.getTaskProgressKey(userId, entityId, entityType);
        console.log("progress in redis was deleted");
        await this.client.del(key);
    }

    // Получение всех ответов для задания (без знания типов)
    async getUserTaskAnswers(userId, entityId, questionIds, entityType) {
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

    getExamTimerKey(userId, examId) {
        return `exam:user:${userId}:exam:${examId}:timer`;
    }

// Сохранить время старта экзамена
    async saveExamStartTime(userId, examId) {
        const key = this.getExamTimerKey(userId, examId);
        const data = {
            startedAt: new Date().toISOString(),
        };
        await this.setWithTTL(key, JSON.stringify(data));
    }

// Получить время старта экзамена
    async getExamStartTime(userId, examId) {
        const key = this.getExamTimerKey(userId, examId);
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

// Получить оставшееся время экзамена в секундах
    async getExamRemainingTime(userId, examId, timeLimitMinutes) {
        const startData = await this.getExamStartTime(userId, examId);
        if (!startData) return null;
        const startedAt = new Date(startData.startedAt).getTime();
        const now = Date.now();
        const elapsed = (now - startedAt) / 1000; // секунды
        const totalSeconds = timeLimitMinutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);
        return remaining;
    }

// Очистить таймер экзамена
    async clearExamTimer(userId, examId) {
        const key = this.getExamTimerKey(userId, examId);
        await this.client.del(key);
    }

// ===== Ключ для флага таймаута экзамена =====
    getExamTimeoutFlagKey(userId, examId) {
        return `exam:user:${userId}:exam:${examId}:timeout`;
    }

// ===== Сохранить флаг завершения по таймауту =====
    async saveExamTimeoutFlag(userId, examId, timeout = true) {
        const key = this.getExamTimeoutFlagKey(userId, examId);
        await this.client.set(key, timeout ? '1' : '0');
        await this.client.expire(key, this.TTL); // 24 часа
    }

// ===== Получить флаг таймаута =====
    async getExamTimeoutFlag(userId, examId) {
        const key = this.getExamTimeoutFlagKey(userId, examId);
        const value = await this.client.get(key);
        return value === '1';
    }

// ===== Очистить флаг таймаута =====
    async clearExamTimeoutFlag(userId, examId) {
        const key = this.getExamTimeoutFlagKey(userId, examId);
        await this.client.del(key);
    }
}

module.exports = new RedisService();
