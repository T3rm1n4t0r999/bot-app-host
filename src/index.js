require('dotenv').config();
const createBot = require('./bot/bot');

(async () => {
    try {
        const bot = await createBot(process.env.BOT_TOKEN);
        bot.start();
        console.log('Бот запущен');
    } catch (error) {
        console.error('Ошибка запуска бота:', error);
    }
})();