const {sequelize} = require('../database/db');
const {DataTypes} = require('sequelize');

const Student = sequelize.define('student', {
    id: {type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true},
    telegram_id: {type: DataTypes.STRING, allowNull: false, unique: true},
    username: {type: DataTypes.STRING, allowNull: false, unique: true},
    firstname: {type: DataTypes.STRING, allowNull: false},
    lastname: {type: DataTypes.STRING, allowNull: false, defaultValue: null},
    role: {
        type: DataTypes.ENUM('guest', 'student', 'premium'),
        allowNull: false,
        defaultValue: 'guest'
    },
    registered_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
    updated_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
    score: {type: DataTypes.BIGINT, allowNull: false, defaultValue: 0},
    rank: {type: DataTypes.STRING, allowNull: false, defaultValue: 'Новичок'},
}, {
    timestamps: false, // Отключаем автоматические createdAt/updatedAt
    underscored: true, // Для snake_case стиля
    tableName: 'students' // Явное указание имени таблицы
});

module.exports = Student;