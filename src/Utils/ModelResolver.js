const Homework = require('../Models/Homework');
const LessonTask = require('../Models/LessonTask');
const Exam = require('../Models/Exam');

const MODEL_TYPE_MAP = {
    'lesson_task': LessonTask,
    'homework': Homework,
    'exam': Exam,
};

function resolveModelType(type) {
    // type – строка, например 'lesson_task'
    return MODEL_TYPE_MAP[type] || null;
}

module.exports = { resolveModelType, MODEL_TYPE_MAP };