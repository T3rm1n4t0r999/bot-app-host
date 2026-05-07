// index_webhook.js
require('dotenv').config();
const express = require('express');
const logger = require('./logger/logger');
const { sequelize } = require("./database/db");
const RedisService = require("./services/redisService");
const { setupAssociations } = require("./models");
const botManager = require('./bot/botManager');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
// Берем URL из переменных окружения. На сервере это будет https://bot.edubot.fun
const PUBLIC_URL = process.env.BOT_PUBLIC_URL || `http://localhost:${PORT}`;

// --- 1. АДМИНСКИЕ РОУТЫ ---

app.post('/admin/start-bot', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        // Передаем PUBLIC_URL, чтобы бот знал, куда ставить Webhook
        const result = await botManager.startBot(token, PUBLIC_URL);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to start bot', details: error.message });
    }
});

app.post('/admin/stop-bot', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        const result = await botManager.stopBot(token);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop bot', details: error.message });
    }
});

// --- 2. WEBHOOK HANDLER ---

app.post('/webhook/:token', async (req, res) => {
    const token = req.params.token;
    const update = req.body;
    const bot = botManager.getBot(token);

    if (bot) {
        try {
            await bot.handleUpdate(update);
            res.status(200).end();
        } catch (error) {
            logger.error(`Error handling update for bot ${token.substring(0, 5)}...`, error);
            res.status(500).end();
        }
    } else {
        logger.warn(`Received update for inactive bot: ${token.substring(0, 5)}...`);
        res.status(200).end();
    }
});

// --- 3. ЗАПУСК ---

(async () => {
    try {
        setupAssociations();
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });
        await RedisService.connect();
        logger.info('Database and Redis connected.');

        app.listen(PORT, () => {
            logger.info(`🚀 Bot server listening on port ${PORT}`);
            logger.info(`🌍 Public URL configured as: ${PUBLIC_URL}`);
        });

    } catch (error) {
        logger.error('Fatal error during startup:', error);
        process.exit(1);
    }
})();