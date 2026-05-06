// bot/bot
const { Bot } = require('grammy');
const mainRoutes = require('../routes/commands'); // Ваши команды
const logger = require('../logger/logger');

/**
 * Создает и настраивает экземпляр бота, но НЕ запускает его и НЕ регистрирует вебхук.
 */
async function createBotInstance(token) {
    try {
        const bot = new Bot(token);


        await bot.init();

        logger.info(`Bot instance created for: @${bot.botInfo.username}`);

        bot.use(mainRoutes);

        return bot;
    } catch (error) {
        logger.error(`Error creating bot instance for token ${token.substring(0, 5)}...:`, error);
        throw error;
    }
}

module.exports = createBotInstance;