const { Bot } = require('grammy');
const mainRoutes = require('../routes/commands');
const proxy = require('../utils/proxy');
const logger = require('../logger/logger');
const {HttpsProxyAgent} = require("https-proxy-agent");
const {SocksProxyAgent} = require("socks-proxy-agent");
async function createBot() {

    try {

        const bot = new Bot(process.env.BOT_TOKEN);

        bot.use(mainRoutes);
        logger.info('Bot created successfully.');
        return bot;
    } catch (error) {
        logger.error('Error creating bot.');
        throw error;
    }
}

module.exports = createBot;