const { Bot } = require('grammy');
const mainRoutes = require('../routes/commands');
const proxy = require('../utils/proxy');
const logger = require('../logger/logger');
const {HttpsProxyAgent} = require("https-proxy-agent");
const {SocksProxyAgent} = require("socks-proxy-agent");
async function createBot() {

    try {
        const proxyUrl = 'http://user394053:02jx6w@163.5.183.11:6899';
        const agent = new HttpsProxyAgent(proxyUrl);

        const bot = new Bot(process.env.BOT_TOKEN);

        if (agent) {
            bot.api.config.use((prev, method, payload, signal) => {
                return prev(method, { ...payload, agent }, signal);
            });
        }

// 🔎 1. Проверяем подключение ДО запуска поллинга
        bot.api.getMe()
            .then(info => console.log(`✅ Бот подключен: @${info.username}`))
            .catch(err => {
                console.error('❌ Не удалось подключиться к Telegram:', err.message);
                process.exit(1);
            });

// 🔎 2. Ловим все ошибки внутри бота
        bot.catch((err) => console.error('[Bot Runtime Error]', err));

        bot.use(mainRoutes);
        logger.info('Bot created successfully.');
        return bot;
    } catch (error) {
        logger.error('Error creating bot.');
        throw error;
    }
}

module.exports = createBot;