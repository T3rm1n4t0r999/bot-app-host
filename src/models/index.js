// models/index.js
const sequelize = require('../database/db');
const Course = require('./course');
const Module = require('./module');
const Lesson = require('./lesson');
const LessonMaterial = require('./lessonMaterial');
const LessonTask = require('./lessonTask');
const TaskQuestion = require('./taskQuestion');
const Homework = require('./homework');
const StudentProgress = require('./studentProgress');
const File = require('./file');
const StudentCourse = require('./studentCourse');
const Student = require('./student');
const logger = require('../logger/logger');
// Настройка ассоциаций
function setupAssociations() {
    Course.hasMany(Module, {
        foreignKey: 'courseId',
        as: 'modules',
        onDelete: 'CASCADE'
    });

    Module.belongsTo(Course, {
        foreignKey: 'courseId',
        as: 'course'
    });

    Module.hasMany(Lesson, {
        foreignKey: 'moduleId',
        as: 'lessons',
        onDelete: 'CASCADE'
    });

    Lesson.belongsTo(Module, {
        foreignKey: 'moduleId',
        as: 'module'
    });

    // Lesson -> LessonMaterial (один ко многим)
    Lesson.hasMany(LessonMaterial, {
        foreignKey: 'lessonId',
        as: 'lessonMaterials',
        onDelete: 'CASCADE'
    });

    LessonMaterial.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    // Lesson -> LessonTask (один к одному или один ко многим)
    Lesson.hasMany(LessonTask, {
        foreignKey: 'lessonId',
        as: 'task',
        onDelete: 'CASCADE'
    });

    LessonTask.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    // LessonTask -> TaskQuestion (один ко многим)
    LessonTask.hasMany(TaskQuestion, {
        foreignKey: 'taskId',
        as: 'questions',
        onDelete: 'CASCADE'
    });

    TaskQuestion.belongsTo(LessonTask, {
        foreignKey: 'taskId',
        as: 'task'
    });

    // Lesson -> Homework (один ко многим)
    Lesson.hasMany(Homework, {
        foreignKey: 'lessonId',
        as: 'homeworks',
        onDelete: 'CASCADE'
    });

    Homework.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    // Полиморфные ассоциации для файлов

    // Файлы для LessonMaterial
    LessonMaterial.hasMany(File, {
        foreignKey: 'attachableId',
        constraints: false,
        scope: {
            attachableType: 'lessonMaterial'
        },
        as: 'files'
    });

    File.belongsTo(LessonMaterial, {
        foreignKey: 'attachableId',
        constraints: false,
        as: 'lessonMaterial'
    });

    // Файлы для LessonTask
    LessonTask.hasMany(File, {
        foreignKey: 'attachableId',
        constraints: false,
        scope: {
            attachableType: 'LessonTask'
        },
        as: 'files'
    });

    File.belongsTo(LessonTask, {
        foreignKey: 'attachableId',
        constraints: false,
        as: 'lessonTask'
    });

    // Файлы для Homework
    Homework.hasMany(File, {
        foreignKey: 'attachableId',
        constraints: false,
        scope: {
            attachableType: 'Homework'
        },
        as: 'files'
    });

    File.belongsTo(Homework, {
        foreignKey: 'attachableId',
        constraints: false,
        as: 'homework'
    });

    // Файлы для TaskQuestion
    TaskQuestion.hasMany(File, {
        foreignKey: 'attachableId',
        constraints: false,
        scope: {
            attachableType: 'taskQuestion'
        },
        as: 'files'
    });

    File.belongsTo(TaskQuestion, {
        foreignKey: 'attachableId',
        constraints: false,
        as: 'taskQuestion'
    });

    // Student associations
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

    // StudentProgress associations
    Student.hasMany(StudentProgress, {
        foreignKey: 'studentId',
        as: 'progressRecords',
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    LessonTask.hasMany(StudentProgress, {
        foreignKey: 'taskId',
        as: 'studentProgress',
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(LessonTask, {
        foreignKey: 'taskId',
        as: 'task'
    });

    // Дополнительные ассоциации для удобства
    Student.belongsToMany(LessonTask, {
        through: StudentProgress,
        foreignKey: 'studentId',
        otherKey: 'taskId',
        as: 'tasksProgress'
    });

    LessonTask.belongsToMany(Student, {
        through: StudentProgress,
        foreignKey: 'taskId',
        otherKey: 'studentId',
        as: 'studentsProgress'
    });
    logger.info('Setup association completed.');
}

module.exports = {
    sequelize,
    Course,
    Module,
    Lesson,
    LessonMaterial,
    LessonTask,
    TaskQuestion,
    Homework,
    StudentProgress,
    File,
    StudentCourse,
    Student,
    setupAssociations
};