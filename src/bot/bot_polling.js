const { Bot: Bot_polling } = require('grammy');
const mainRoutes = require('../routes/commands');
const logger = require('../logger/logger');
async function createBot() {

    try {

        const bot = new Bot_polling(process.env.BOT_TOKEN);

        bot.use(mainRoutes);
        logger.info('Bot_polling created successfully.');
        return bot;
    } catch (error) {
        logger.error('Error creating bot.');
        throw error;
    }
}

module.exports = createBot;