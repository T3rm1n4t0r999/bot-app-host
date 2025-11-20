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
        foreignKey: 'course_id',
        as: 'modules',
        onDelete: 'CASCADE'
    });

    Module.belongsTo(Course, {
        foreignKey: 'course_id',
        as: 'course'
    });

    Module.hasMany(Lesson, {
        foreignKey: 'module_id',
        as: 'lessons',
        onDelete: 'CASCADE'
    });

    Lesson.belongsTo(Module, {
        foreignKey: 'module_id',
        as: 'module'
    });

    // Lesson -> LessonMaterial (один ко многим)
    Lesson.hasMany(LessonMaterial, {
        foreignKey: 'lesson_id',
        as: 'lessonMaterials',
        onDelete: 'CASCADE'
    });

    LessonMaterial.belongsTo(Lesson, {
        foreignKey: 'lesson_id',
        as: 'lesson'
    });

    // Lesson -> LessonTask (один к одному или один ко многим)
    Lesson.hasMany(LessonTask, {
        foreignKey: 'lesson_id',
        as: 'tasks',
        onDelete: 'CASCADE'
    });

    LessonTask.belongsTo(Lesson, {
        foreignKey: 'lesson_id',
        as: 'lesson'
    });

    // LessonTask -> TaskQuestion (один ко многим)
    LessonTask.hasMany(TaskQuestion, {
        foreignKey: 'task_id',
        as: 'questions',
        onDelete: 'CASCADE'
    });

    TaskQuestion.belongsTo(LessonTask, {
        foreignKey: 'task_id',
        as: 'task'
    });

    // Lesson -> Homework (один ко многим)
    Lesson.hasMany(Homework, {
        foreignKey: 'lesson_id',
        as: 'homeworks',
        onDelete: 'CASCADE'
    });

    Homework.belongsTo(Lesson, {
        foreignKey: 'lesson_id',
        as: 'lesson'
    });

    // Полиморфные ассоциации для файлов

    // LessonMaterial имеет много файлов
    LessonMaterial.hasMany(File, {
        foreignKey: 'fileable_id',
        constraints: false,
        scope: {
            fileable_type: 'LessonMaterial'
        },
        as: 'files'
    });

    File.belongsTo(LessonMaterial, {
        foreignKey: 'fileable_id',
        constraints: false,
        as: 'lessonMaterial'
    });

    // LessonTask имеет много файлов
    LessonTask.hasMany(File, {
        foreignKey: 'fileable_id',
        constraints: false,
        scope: {
            fileable_type: 'LessonTask'
        },
        as: 'files'
    });

    File.belongsTo(LessonTask, {
        foreignKey: 'fileable_id',
        constraints: false,
        as: 'lessonTask'
    });

    // Homework имеет много файлов
    Homework.hasMany(File, {
        foreignKey: 'fileable_id',
        constraints: false,
        scope: {
            fileable_type: 'Homework'
        },
        as: 'files'
    });

    File.belongsTo(Homework, {
        foreignKey: 'fileable_id',
        constraints: false,
        as: 'homework'
    });

    // TaskQuestion имеет много файлов
    TaskQuestion.hasMany(File, {
        foreignKey: 'fileable_id',
        constraints: false,
        scope: {
            fileable_type: 'TaskQuestion'
        },
        as: 'files'
    });

    File.belongsTo(TaskQuestion, {
        foreignKey: 'fileable_id',
        constraints: false,
        as: 'taskQuestion'
    });

    // Course имеет много файлов (например, для обложек курсов)
    Course.hasMany(File, {
        foreignKey: 'fileable_id',
        constraints: false,
        scope: {
            fileable_type: 'Course'
        },
        as: 'files'
    });

    File.belongsTo(Course, {
        foreignKey: 'fileable_id',
        constraints: false,
        as: 'course'
    });

    // Student associations (без изменений)
    Student.belongsToMany(Course, {
        through: StudentCourse,
        foreignKey: 'student_id',
        as: 'accessibleCourses'
    });

    Course.belongsToMany(Student, {
        through: StudentCourse,
        foreignKey: 'course_id',
        as: 'studentsWithAccess'
    });

    StudentCourse.belongsTo(Student, {
        foreignKey: 'student_id',
        as: 'student'
    });

    StudentCourse.belongsTo(Course, {
        foreignKey: 'course_id',
        as: 'course'
    });

    // StudentProgress associations
    Student.hasMany(StudentProgress, {
        foreignKey: 'student_id',
        as: 'progressRecords',
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(Student, {
        foreignKey: 'student_id',
        as: 'student'
    });

    LessonTask.hasMany(StudentProgress, {
        foreignKey: 'task_id',
        as: 'studentProgress',
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(LessonTask, {
        foreignKey: 'task_id',
        as: 'task'
    });

    // Дополнительные ассоциации для удобства
    Student.belongsToMany(LessonTask, {
        through: StudentProgress,
        foreignKey: 'student_id',
        otherKey: 'task_id',
        as: 'tasksProgress'
    });

    LessonTask.belongsToMany(Student, {
        through: StudentProgress,
        foreignKey: 'task_id',
        otherKey: 'student_id',
        as: 'studentsProgress'
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
    TaskQuestion,
    Homework,
    StudentProgress,
    File,
    StudentCourse,
    Student,
    setupAssociations
};