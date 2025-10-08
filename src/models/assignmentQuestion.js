// models/AssignmentQuestion.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const AssignmentQuestion = sequelize.define('AssignmentQuestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // Тип вопроса (single_choice, multiple_choice, text, code)
    questionType: {
        type: DataTypes.ENUM('single_choice', 'multiple_choice', 'text', 'code', 'file_upload'),
        defaultValue: 'text'
    },
    // Варианты ответов (для choice типов)
    options: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Правильные ответы
    correctAnswers: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Баллы за вопрос
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    // Объяснение правильного ответа
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Порядок вопроса
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    assignmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lesson_assignments',
            key: 'id'
        }
    },
    created_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
    updated_at: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
}, {
    tableName: 'assignment_questions',
    timestamps: false
});

module.exports = AssignmentQuestion;