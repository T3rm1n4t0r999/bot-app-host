const {sequelize} = require('../database/db');
const {DataTypes} = require('sequelize');


const Exam = sequelize.define('Exam', {
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
    moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'modules',
            key: 'id'
        }
    },
    maxScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    maxAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'exams',
    underscored: true,
    timestamps: true
});


module.exports = Exam;