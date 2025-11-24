// models/index.js
const sequelize = require('../database/db');
const Course = require('./course');
const Module = require('./module');
const Lesson = require('./lesson');
const LessonMaterial = require('./lessonMaterial');
const LessonTask = require('./lessonTask');
const Homework = require('./homework');
const StudentProgress = require('./studentProgress');
const File = require('./file');
const StudentCourse = require('./studentCourse');
const Student = require('./student');
const StudentHomework = require('./studentHomework');
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
        as: 'tasks',
        onDelete: 'CASCADE'
    });

    LessonTask.belongsTo(Lesson, {
        foreignKey: 'lesson_id',
        as: 'lesson'
    });

    // LessonMaterial имеет много файлов
    LessonMaterial.hasMany(File, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'LessonMaterial'
        },
        as: 'files'
    });

    File.belongsTo(LessonMaterial, {
        foreignKey: 'fileableId',
        constraints: false,
        as: 'lessonMaterial'
    });

    // LessonTask имеет много файлов
    LessonTask.hasMany(File, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'LessonTask'
        },
        as: 'files'
    });

    File.belongsTo(LessonTask, {
        foreignKey: 'fileableId',
        constraints: false,
        as: 'lessonTask'
    });

    // Homework имеет много файлов
    Homework.hasMany(File, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'Homework'
        },
        as: 'files'
    });

    File.belongsTo(Homework, {
        foreignKey: 'fileableId',
        constraints: false,
        as: 'homework'
    });

    // Course имеет много файлов (например, для обложек курсов)
    Course.hasMany(File, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'Course'
        },
        as: 'files'
    });

    File.belongsTo(Course, {
        foreignKey: 'fileableId',
        constraints: false,
        as: 'course'
    });

    // Student associations (без изменений)
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
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    LessonTask.hasMany(StudentProgress, {
        foreignKey: 'progressableId',
        as: 'studentProgress',
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(LessonTask, {
        foreignKey: 'progressableId',
        as: 'task'
    });

    // Homework ↔ LessonTask (Домашнее задание принадлежит заданию урока)
    Homework.belongsTo(LessonTask, {
        foreignKey: 'taskId',
        as: 'task'
    });

    LessonTask.hasOne(Homework, {
        foreignKey: 'taskId',
        as: 'homework'
    });

    Homework.belongsToMany(Student, {
        through: StudentHomework,
        foreignKey: 'homeworkId',
        otherKey: 'studentId'
        })

    Homework.hasMany(StudentHomework, {
        foreignKey: 'homeworkId',
        as: 'studentSubmissions'
    });

    Student.hasMany(StudentHomework, {
        foreignKey: 'studentId',
        as: 'homeworkSubmissions'
    });

    StudentHomework.belongsTo(Homework, {
        foreignKey: 'homeworkId',
        as: 'homework'
    });

    StudentHomework.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    logger.info('Setup associations completed.');
}

module.exports = {
    sequelize,
    Course,
    Module,
    Lesson,
    LessonMaterial,
    LessonTask,
    Homework,
    StudentProgress,
    File,
    StudentCourse,
    Student,
    setupAssociations
};