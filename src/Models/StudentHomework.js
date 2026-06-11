// Models/StudentHomework.js
const { sequelize } = require('../Database/db');
const { DataTypes } = require('sequelize');

const StudentHomework = sequelize.define('StudentHomework', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    homeworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'homeworks',
            key: 'id'
        }
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    grantedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'admin'
    },
    grantedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'student_homeworks',
    timestamps: true,
    underscored: true,
});

module.exports = StudentHomework;
