const {sequelize} = require('../database/db');
const {DataTypes} = require('sequelize');

const Student = sequelize.define('student', {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    telegramId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    role: {
        type: DataTypes.ENUM('guest', 'student', 'premium'),
        allowNull: false,
        defaultValue: 'guest'
    },
    score: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    rank: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Новичок'
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'students'
});

module.exports = Student;