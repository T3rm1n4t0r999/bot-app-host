const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const StudentCourse = sequelize.define('StudentCourse', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
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
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    progress: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    lastAccessed: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'student_courses',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'courseId']
        }
    ]
});

module.exports = StudentCourse;