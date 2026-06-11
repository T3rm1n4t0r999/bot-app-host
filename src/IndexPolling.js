require('dotenv').config();
const createBot = require('./bot/BotPolling');
const {sequelize} = require("./database/db");
const RedisService = require("./services/RedisService");
const {setupAssociations} = require("./models");
const logger = require("./logger/Logger");

(async () => {
    try {
        setupAssociations();

        await sequelize.authenticate();
        await sequelize.sync(false);

        const bot = await createBot(process.env.BOT_TOKEN);
        await RedisService.connect();
        await bot.start();

    } catch (error) {
        logger.error('Error while starting app.');
        throw error;
    }
})();