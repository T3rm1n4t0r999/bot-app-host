
const createBotInstance = require('./bot');
const axios = require('axios');
const logger = require('../logger/logger');

class BotManager {
    constructor() {
        // Хранилище: Key = Token, Value = Bot Instance
        this.activeBots = new Map();
    }

    /**
     * Запускает бота: создает экземпляр и регистрирует вебхук в Telegram.
     * @param {string} token - Токен бота
     * @param {string} baseUrl - Базовый URL туннеля (например, https://xyz.loca.lt)
     */
    async startBot(token, baseUrl) {
        if (!baseUrl) {
            throw new Error('Base URL (tunnel) is not ready');
        }

        if (this.activeBots.has(token)) {
            logger.warn(`Bot ${token.substring(0, 5)}... is already running.`);
            return { success: true, message: 'Already running' };
        }

        try {
            // 1. Создаем экземпляр бота (грамматику, роуты)
            const bot = await createBotInstance(token);

            // 2. Сохраняем в память
            this.activeBots.set(token, bot);

            // 3. Формируем уникальный URL вебхука
            // Telegram будет слать сюда: https://xyz.loca.lt/webhook/TOKEN_HERE
            const webhookUrl = `${baseUrl}/webhook/${token}`;

            // 4. Регистрируем вебхук в Telegram API
            await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
                url: webhookUrl
            });

            logger.info(`✅ Bot started: @${bot.botInfo.username}. Webhook set to ${webhookUrl}`);
            return { success: true, message: 'Bot started' };

        } catch (error) {
            // Если ошибка, обязательно чистим память, чтобы не было "битого" бота
            this.activeBots.delete(token);
            logger.error(`❌ Failed to start bot ${token.substring(0, 5)}...:`, error.message);
            throw error;
        }
    }

    /**
     * Останавливает бота: удаляет вебхук и убирает из памяти.
     */
    async stopBot(token) {
        const bot = this.activeBots.get(token);
        if (!bot) {
            return { success: false, message: 'Bot not found' };
        }

        try {
            // 1. Удаляем вебхук в Telegram
            await axios.post(`https://api.telegram.org/bot${token}/deleteWebhook`);

            // 2. Удаляем из памяти
            this.activeBots.delete(token);

            logger.info(`🛑 Bot stopped: ${token.substring(0, 5)}...`);
            return { success: true, message: 'Bot stopped' };
        } catch (error) {
            logger.error(`Error stopping bot ${token.substring(0, 5)}...:`, error.message);
            // Даже если не удалось удалить вебхук в API, удаляем из памяти локально
            this.activeBots.delete(token);
            throw error;
        }
    }

    /**
     * Метод для обработки входящего обновления (вызывается из Express)
     */
    getBot(token) {
        return this.activeBots.get(token);
    }

    // Полезно для дебага
    getActiveBotsCount() {
        return this.activeBots.size;
    }
}

// Экспортируем синглтон
module.exports = new BotManager();