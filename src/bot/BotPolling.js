const { Bot: BotPolling } = require('grammy');
const mainRoutes = require('../routes/Commands');
const logger = require('../logger/Logger');
async function createBot() {

    try {

        const bot = new BotPolling(process.env.BOT_TOKEN);

        bot.use(mainRoutes);
        logger.info('BotPolling created successfully.');
        return bot;
    } catch (error) {
        logger.error('Error creating bot.');
        throw error;
    }
}

module.exports = createBot;