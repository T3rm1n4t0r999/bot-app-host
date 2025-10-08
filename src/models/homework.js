// models/Homework.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const Homework = sequelize.define('Homework', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    maxScore: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Дополнительные настройки
    settings: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id'
        }
    },
    created_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
    updated_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
}, {
    tableName: 'homeworks',
    timestamps: false
});

module.exports = Homework;