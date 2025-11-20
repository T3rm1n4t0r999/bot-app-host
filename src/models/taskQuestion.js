// models/TaskQuestion.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const TaskQuestion = sequelize.define('TaskQuestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    questionType: {
        type: DataTypes.ENUM('single_choice', 'multiple_choice', 'text'),
        defaultValue: 'text'
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    correctAnswers: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lesson_task',
            key: 'id'
        }
    }
}, {
    tableName: 'task_questions',
    timestamps: false,
    underscored: true,

});

module.exports = TaskQuestion;