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
    }
}, {
    tableName: 'student_courses',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'course_id']
        }
    ]
});

module.exports = StudentCourse;