// Models/LessonMaterial.js
const { sequelize } = require('../Database/db');
const { DataTypes } = require('sequelize');

const LessonMaterial = sequelize.define('LessonMaterial', {
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
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    materialType: {
        type: DataTypes.ENUM('theory', 'reference', 'video_lesson', 'article'),
        defaultValue: 'theory'
    },
    video_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id'
        }
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'lesson_materials',
    timestamps: true,
    underscored: true,
});


module.exports = LessonMaterial;