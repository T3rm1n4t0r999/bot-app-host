const { Bot } = require('grammy');
const mainRoutes = require('../routes/commands');
const {sequelize} = require('../database/db');
const { SocksProxyAgent } = require('socks-proxy-agent');
const {setupAssociations} = require("../models");
const RedisService = require('../services/redisService');

async function createBot(token) {
    // Проверка подключения к БД
    try {
        await sequelize.authenticate();
        console.log('Подключение к БД успешно');
        await RedisService.connect();
        setupAssociations();
        await sequelize.sync(false);
    } catch (error) {
        console.error('Ошибка подключения к БД:', error);
        process.exit(1);
    }

    const proxyUrl = process.env.SOCKS_PROXY;
    const agent = new SocksProxyAgent(proxyUrl);

    const bot = new Bot(process.env.BOT_TOKEN);

    bot.use(mainRoutes);

    return bot;
}

module.exports = createBot;