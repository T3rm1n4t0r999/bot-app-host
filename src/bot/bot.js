const { Bot } = require('grammy');
const mainRoutes = require('../routes/commands');
const proxy = require('../utils/proxy');
const logger = require('../logger/logger');
async function createBot(token) {

    try {
        const bot = new Bot(process.env.BOT_TOKEN);
        const agent = proxy.getProxyAgent()
        if (agent) {
            bot.api.config.use((prev, method, payload, signal) => {
                return prev(method, {
                    ...payload,
                    agent: agent
                }, signal);
            });
        }

        bot.use(mainRoutes);
        logger.info('Bot created successfully.');
        return bot;
    } catch (error) {
        logger.error('Error creating bot.');
        throw error;
    }
}

module.exports = createBot;