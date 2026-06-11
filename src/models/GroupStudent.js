// models/GroupStudent.js
const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const GroupStudent = sequelize.define('GroupStudent', {
    groupId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'groups',
            key: 'id'
        },
        primaryKey: true
    },
    studentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        },
        primaryKey: true
    }
}, {
    tableName: 'group_student',
    timestamps: false,
    underscored: true,
    freezeTableName: true
});

module.exports = GroupStudent;