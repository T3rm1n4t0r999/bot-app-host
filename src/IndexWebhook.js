// IndexWebhook.js
require('dotenv').config();
const express = require('express');
const logger = require('./Logger/Logger');
const { sequelize } = require("./Database/db");
const RedisService = require("./Services/RedisService");
const { setupAssociations } = require("./Models");
const botManager = require('./Bot/BotManager');
const {post} = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
// Берем URL из переменных окружения. На сервере это будет https://bot.edubot.fun
const PUBLIC_URL = process.env.BOT_PUBLIC_URL || `http://localhost:${PORT}`;
const MANAGER_SECRET = process.env.MANAGER_SECRET || 'your-secret-token';

// --- 1. АДМИНСКИЕ РОУТЫ ---


// 👇 ДОБАВЛЕНО: для синхронизации с Laravel
// --- 1. АДМИНСКИЕ РОУТЫ ---

// 👇 ДОБАВЛЕНО: Middleware для проверки токена от Laravel
const verifyManagerToken = (req, res, next) => {
    const token = req.header('X-Manager-Token');
    if (token !== MANAGER_SECRET) {
        logger.warn(`Unauthorized access attempt to admin route`);
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Применяем Middleware ко всем /admin/* роутам
app.use('/admin', verifyManagerToken);


app.post('/admin/start-bot', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        // Передаем PUBLIC_URL, чтобы бот знал, куда ставить Webhook
        const result = await botManager.startBot(token, PUBLIC_URL);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to start Bot', details: error.message });
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
        res.status(500).json({ error: 'Failed to stop Bot', details: error.message });
    }
});

app.get('/admin/active-bots', (req, res) => {
    const activeTokens = Array.from(botManager.activeBots.keys());
    logger.info(`Laravel requested active bots. Count: ${activeTokens.length}`);
    res.json({ active_tokens: activeTokens });
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

async function syncBotsOnStartup() {
    try {
        logger.info('🔄 Запуск синхронизации активных ботов из Laravel...');

        const response = await post(
            `${PUBLIC_URL}/api/bot-manager/active-bots`,
            {},
            {
                headers: { 'X-Manager-Token': MANAGER_SECRET },
                timeout: 15000 // 15 секунд на ответ от Laravel
            }
        );

        const activeBots = response.data.bots || [];
        logger.info(`📥 Найдено ${activeBots.length} активных ботов в БД Laravel.`);

        let successCount = 0;
        let failCount = 0;

        for (const botData of activeBots) {
            try {
                await botManager.startBot(botData.token, PUBLIC_URL);
                successCount++;
            } catch (err) {
                failCount++;
                logger.error(`❌ Не удалось запустить бота ID ${botData.id} при старте:`, err.message);
            }
        }

        logger.info(`✅ Синхронизация завершена. Успешно: ${successCount}, Ошибок: ${failCount}`);

    } catch (error) {
        // Критично: если Laravel недоступен, не падаем, просто логируем
        logger.error('❌ Ошибка синхронизации при старте Node.js:', error.message);
        logger.warn('⚠️  Сервер запущен, но боты не восстановлены из БД.');
    }
}

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
            syncBotsOnStartup();
        });

    } catch (error) {
        logger.error('Fatal error during startup:', error);
        process.exit(1);
    }
})();