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
    maxScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessonTask',
            key: 'id'
        }
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'homeworks',
    timestamps: true,
    underscored: true,
});

module.exports = Homework;