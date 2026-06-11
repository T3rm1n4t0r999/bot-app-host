const { sequelize } = require('../Database/db');
const { DataTypes } = require('sequelize');

const GroupCourse = sequelize.define('GroupCourse', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    groupId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'groups',
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
}, {
    tableName: 'group_course',
    timestamps: false,
    underscored: true,
});

module.exports = GroupCourse;