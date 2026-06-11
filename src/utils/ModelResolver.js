const Homework = require('../models/Homework');
const LessonTask = require('../models/LessonTask');
const Exam = require('../models/Exam');

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