// models/Question.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const question = sequelize.define('Question', {
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
        type: DataTypes.ENUM('single_choice', 'multiple_choice', 'text', 'code', 'file'),
        defaultValue: 'text'
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    correctAnswers: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Stores correct answers based on question type'
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 0
        }
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    questionableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID of the parent entity (LessonTask, Homework, etc.)'
    },
    questionableType: {
        type: DataTypes.ENUM('lesson_task', 'homework', 'training', 'quiz'),
        allowNull: false,
        comment: 'Type of the parent entity'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional metadata for future extensions'
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Explanation for the answer'
    }
}, {
    tableName: 'questions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['questionable_type', 'questionable_id', 'order']
        }
    ]
});

module.exports = question;