// models/LessonTask.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const LessonTask = sequelize.define('LessonTask', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    maxScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id'
        }
    }
}, {
    tableName: 'lesson_task',
    timestamps: true,
    underscored: true,
});



module.exports = LessonTask;