// models/index_webhook.js
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
const Exam = require('./exam');
const StudentExam = require('./studentExam');
const Invitation = require('./invitation');
const logger = require('../logger/logger');
const Organization = require("./organization");
const Bot = require("./bot");
const Group = require("./group");
const GroupStudent = require("./groupStudent");
const GroupCourse = require("./groupCourse");
const Question = require("./question");
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

    Organization.hasOne(Bot, {
        foreignKey: 'organization_id',
        as: 'bot'
    });

    Organization.hasMany(Invitation, {
        foreignKey: 'organization_id',
        as: 'invitations'
    });

    Bot.belongsTo(Organization, {
        foreignKey: 'organization_id',
        as: 'organization'
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

    Lesson.hasMany(LessonMaterial, {
        foreignKey: 'lessonId',
        as: 'lessonMaterials',
        onDelete: 'CASCADE'
    });

    LessonMaterial.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    Lesson.hasMany(LessonTask, {
        foreignKey: 'lessonId',
        as: 'tasks',
        onDelete: 'CASCADE'
    });

    LessonTask.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'lesson'
    });

    LessonMaterial.hasMany(File, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'LessonMaterial'  // ← PascalCase как в БД
        },
        as: 'files'
    });

    File.belongsTo(LessonMaterial, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'LessonMaterial'  // ← Тоже PascalCase
        },
        as: 'lessonMaterial'
    });

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

    Course.hasMany(StudentCourse, {
        foreignKey: 'courseId',
        as: 'studentCourses'
    });

    Course.belongsToMany(Student, {
        through: StudentCourse,
        foreignKey: 'courseId',
        as: 'studentsWithAccess'
    });

    // Student associations (без изменений)
    Student.belongsToMany(Course, {
        through: StudentCourse,
        foreignKey: 'studentId',
        as: 'accessibleCourses'
    });

    StudentCourse.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    StudentCourse.belongsTo(Course, {
        foreignKey: 'courseId',
        as: 'course'
    });


    Course.hasMany(GroupCourse, {
        foreignKey: 'courseId',
        as: 'groupCourses'
    });

    Course.belongsToMany(Group, {
        through: GroupCourse,
        foreignKey: 'courseId',
        as: 'groupWithAccess'
    });

    // Student associations (без изменений)
    Group.belongsToMany(Course, {
        through: GroupCourse,
        foreignKey: 'groupId',
        as: 'accessibleCourses'
    });

    GroupCourse.belongsTo(Group, {
        foreignKey: 'groupId',
        as: 'group'
    });

    GroupCourse.belongsTo(Course, {
        foreignKey: 'courseId',
        as: 'course'
    });

    // StudentProgress associations
    Student.hasMany(StudentProgress, {
        foreignKey: 'studentId',
        onDelete: 'CASCADE'
    });

    Organization.hasMany(StudentProgress, {
        foreignKey: 'organizationId',
        onDelete: 'CASCADE'
    });

    StudentProgress.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    StudentProgress.belongsTo(Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
    });

    // Homework ↔ LessonTask (Домашнее задание принадлежит уроку)
    Homework.belongsTo(Lesson, {
        foreignKey: 'lessonId',
        as: 'task'
    });

    Lesson.hasOne(Homework, {
        foreignKey: 'lessonId',
        as: 'homework'
    });

    Homework.hasMany(StudentHomework, {
        foreignKey: 'homeworkId',
        as: 'studentHomeworks'
    });

    Homework.belongsToMany(Student, {
        through: StudentHomework,
        foreignKey: 'homeworkId',
        otherKey: 'studentId', // Явно указываем otherKey, чтобы избежать ошибок нейминга
        as: 'studentsWithSubmissions'
    });

    Student.belongsToMany(Homework, {
        through: StudentHomework,
        foreignKey: 'studentId',
        otherKey: 'homeworkId',
        as: 'assignedHomeworks' // Алиас для получения всех ДЗ студента
    });


    StudentHomework.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    });

    StudentHomework.belongsTo(Homework, {
        foreignKey: 'homeworkId',
        as: 'homework'
    });

    StudentExam.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
    })

    StudentExam.belongsTo(Exam, {
        foreignKey: 'examId',
        as: 'exam'
    })

    Student.hasMany(StudentExam, {
        foreignKey: 'StudentId',
        as: 'student'
    })

    Exam.hasMany(StudentExam, {
        foreignKey: 'examId',
        as: 'studentExams'
    })

    Invitation.belongsTo(Group, {
        foreignKey: 'groupId',
        as: 'group'
    });

    Group.belongsToMany(Student, {
        through: GroupStudent,
        foreignKey: 'groupId',
        otherKey: 'studentId',
        as: 'students'
    });

    Student.belongsToMany(Group, {
        through: GroupStudent,
        foreignKey: 'studentId',
        otherKey: 'groupId',
        as: 'groups'
    });

    Question.hasMany(File, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'Question'
        },
        as: 'files'
    });

    File.belongsTo(Question, {
        foreignKey: 'fileableId',
        constraints: false,
        scope: {
            fileable_type: 'Question'
        },
        as: 'question'
    });

    LessonTask.hasMany(Question, {
        foreignKey: 'questionableId',
        constraints: false,
        scope: { questionable_type: 'lesson_task' },
        as: 'questions'
    });
    Question.belongsTo(LessonTask, {
        foreignKey: 'questionableId',
        constraints: false,
        scope: { questionable_type: 'lesson_task' },
        as: 'lessonTask'
    });

// Вопросы для домашних заданий
    Homework.hasMany(Question, {
        foreignKey: 'questionableId',
        constraints: false,
        scope: { questionable_type: 'homework' },
        as: 'questions'
    });
    Question.belongsTo(Homework, {
        foreignKey: 'questionableId',
        constraints: false,
        scope: { questionable_type: 'homework' },
        as: 'homework'
    });

// Вопросы для экзаменов
    Exam.hasMany(Question, {
        foreignKey: 'questionableId',
        constraints: false,
        scope: { questionable_type: 'exam' },
        as: 'questions'
    });
    Question.belongsTo(Exam, {
        foreignKey: 'questionableId',
        constraints: false,
        scope: { questionable_type: 'exam' },
        as: 'exam'
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
    GroupCourse,
    Group,
    GroupStudent,
    Question,
    setupAssociations
};