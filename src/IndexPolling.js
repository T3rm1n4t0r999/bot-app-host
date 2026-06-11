require('dotenv').config();
const createBot = require('./Bot/BotPolling');
const {sequelize} = require("./Database/db");
const RedisService = require("./Services/RedisService");
const {setupAssociations} = require("./Models");
const logger = require("./Logger/Logger");

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