// models/StudentProgress.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const StudentProgress = sequelize.define('StudentProgress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    answers: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    maxPoints: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    progressableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID сущности (LessonTask, Homework, Training, etc.)'
    },
    progressableType: {
        type: DataTypes.ENUM('lesson_task', 'homework', 'exam'),
        allowNull: false,
        comment: 'Тип сущности'
    },
    attempt:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '1'
    },
    organizationId:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    checked:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    checkedBy:{
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    finishedByTimeout:{
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
}, {
    tableName: 'student_progress',
    timestamps: true,
    underscored: true,
    indexes: [
        // Уникальный индекс для предотвращения дублирования попыток
        {
            unique: true,
            fields: ['student_id', 'progressable_type', 'progressable_id', 'attempt'],
            name: 'student_progress_unique_attempt'
        },
        // Индексы для быстрого поиска
        {
            fields: ['progressable_type', 'progressable_id']
        },
        {
            fields: ['student_id', 'progressable_type', 'progressable_id']
        },
        {
            fields: ['student_id', 'attempt']
        },
        {
            fields: ['points']
        }
    ],
});


module.exports = StudentProgress;