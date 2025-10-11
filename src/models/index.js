// models/index.js
const sequelize = require('../database/db');
const Course = require('./course');
const Module = require('./module');
const Lesson = require('./lesson');
const LearningMaterial = require('./lessonMaterial');
const LessonAssignment = require('./lessonTask');
const AssignmentQuestion = require('./taskQuestion');
const Homework = require('./homework');
const StudentProgress = require('./studentProgress');
const File = require('./file');
const StudentCourse = require('./studentCourse');
const Student = require('./student');
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

    // Lesson -> LearningMaterial (один ко многим)
    Lesson.hasMany(LearningMaterial, {
        foreignKey: 'lessonId',
        as: 'learningMaterials',
        onDelete: 'CASCADE'
    });

    LearningMaterial.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    // Lesson -> LessonAssignment (один к одному или один ко многим)
    Lesson.hasMany(LessonAssignment, {
        foreignKey: 'lessonId',
        as: 'assignments',
        onDelete: 'CASCADE'
    });

    LessonAssignment.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    // LessonAssignment -> AssignmentQuestion (один ко многим)
    LessonAssignment.hasMany(AssignmentQuestion, {
        foreignKey: 'assignmentId',
        as: 'questions',
        onDelete: 'CASCADE'
    });

    AssignmentQuestion.belongsTo(LessonAssignment, {
        foreignKey: 'assignmentId',
        as: 'assignment'
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

    // Файлы для LearningMaterial
    LearningMaterial.hasMany(File, {
        foreignKey: 'attachableId',
        constraints: false,
        scope: {
            attachableType: 'LearningMaterial'
        },
        as: 'files'
    });

    File.belongsTo(LearningMaterial, {
        foreignKey: 'attachableId',
        constraints: false,
        as: 'learningMaterial'
    });

    // Файлы для LessonAssignment
    LessonAssignment.hasMany(File, {
        foreignKey: 'attachableId',
        constraints: false,
        scope: {
            attachableType: 'LessonAssignment'
        },
        as: 'files'
    });

    File.belongsTo(LessonAssignment, {
        foreignKey: 'attachableId',
        constraints: false,
        as: 'lessonAssignment'
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

    // Файлы для AssignmentQuestion
    AssignmentQuestion.hasMany(File, {
        foreignKey: 'attachableId',
        constraints: false,
        scope: {
            attachableType: 'AssignmentQuestion'
        },
        as: 'files'
    });

    File.belongsTo(AssignmentQuestion, {
        foreignKey: 'attachableId',
        constraints: false,
        as: 'assignmentQuestion'
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

    LessonAssignment.hasMany(StudentProgress, {
        foreignKey: 'assignmentId',
        as: 'studentProgress',
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(LessonAssignment, {
        foreignKey: 'assignmentId',
        as: 'assignment'
    });

    // Дополнительные ассоциации для удобства
    Student.belongsToMany(LessonAssignment, {
        through: StudentProgress,
        foreignKey: 'studentId',
        otherKey: 'assignmentId',
        as: 'assignmentsProgress'
    });

    LessonAssignment.belongsToMany(Student, {
        through: StudentProgress,
        foreignKey: 'assignmentId',
        otherKey: 'studentId',
        as: 'studentsProgress'
    });
}

module.exports = {
    sequelize,
    Course,
    Module,
    Lesson,
    LearningMaterial,
    LessonAssignment,
    AssignmentQuestion,
    Homework,
    StudentProgress,
    File,
    StudentCourse,
    Student,
    setupAssociations
};