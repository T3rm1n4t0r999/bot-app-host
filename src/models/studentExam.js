const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const StudentExam = sequelize.define('StudentExam', {
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
    examId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'exams',
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
    tableName: 'student_exams',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'exam_id']
        }
    ]
});

module.exports = StudentExam;