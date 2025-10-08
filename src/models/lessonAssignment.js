// models/LessonAssignment.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const LessonAssignment = sequelize.define('LessonAssignment', {
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
    // Инструкции по выполнению задания
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Максимальное количество баллов
    maxScore: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    // Оценочные критерии
    gradingCriteria: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // Время на выполнение (в минутах)
    estimatedTime: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Сложность задания
    difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium'
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
    tableName: 'lesson_assignments',
    timestamps: false
});

module.exports = LessonAssignment;