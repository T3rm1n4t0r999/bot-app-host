// database/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Создаем единственный экземпляр sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
);

// Функция для проверки подключения
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        return false;
    }
}

module.exports = {
    sequelize,
    testConnection
};