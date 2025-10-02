const studentCache = require("./cache");

class StudentCacheManager {
    static cacheStudent(student) {
        const key = `student:${student.telegram_id}`;
        studentCache.set(key, student, 15); // 15 cекунд
    }

    static getStudent(telegram_id) {
        const key = `student:${telegram_id}`;
        return studentCache.get(key);
    }

    static cacheRegistrationResult(telegramId, result) {
        const key = `reg_result:${telegramId}`;
        studentCache.set(key, result, 60); // 1 минута
    }

    static getRegistrationResult(telegramId) {
        const key = `reg_result:${telegramId}`;
        return studentCache.get(key);
    }
}

module.exports = StudentCacheManager;