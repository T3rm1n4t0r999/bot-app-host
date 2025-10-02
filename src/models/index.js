const sequelize = require('../database/db');
const Course = require('./course');
const Module = require('./module');
const Lesson = require('./lesson');
const StudentCourse = require('./studentCourse');
const Student = require('./student');

// Настройка ассоциаций
function setupAssociations() {
    // Course -> Module (один ко многим)
    Course.hasMany(Module, {
        foreignKey: 'courseId',
        as: 'modules',
        onDelete: 'CASCADE'
    });

    Module.belongsTo(Course, {
        foreignKey: 'courseId',
        as: 'course'
    });

    // Module -> Lesson (один ко многим)
    Module.hasMany(Lesson, {
        foreignKey: 'moduleId',
        as: 'lessons',
        onDelete: 'CASCADE'
    });

    Lesson.belongsTo(Module, {
        foreignKey: 'moduleId',
        as: 'module'
    });

    Student.belongsToMany(Course, {
        through: StudentCourse,
        foreignKey: 'studentId',
        as: 'accessibleCourses'
    });

    Course.belongsToMany(Student, {
        through: StudentCourse,
        foreignKey: 'courseId',
        as: 'studentsWithAccess'
    });

    StudentCourse.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    StudentCourse.belongsTo(Course, {
        foreignKey: 'courseId',
        as: 'course'
    });
}

module.exports = {
    sequelize,
    Course,
    Module,
    Lesson,
    StudentCourse,
    setupAssociations
};