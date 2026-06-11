const { Bot: BotPolling } = require('grammy');
const mainRoutes = require('../Routes/Commands');
const logger = require('../Logger/Logger');
async function createBot() {

    try {

        const bot = new BotPolling(process.env.BOT_TOKEN);

        bot.use(mainRoutes);
        logger.info('BotPolling created successfully.');
        return bot;
    } catch (error) {
        logger.error('Error creating Bot.');
        throw error;
    }
}

module.exports = createBot;