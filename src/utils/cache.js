const NodeCache = require('node-cache');

// Создаем экземпляр кеша
const studentCache = new NodeCache({
    stdTTL: 30, // 30 секунд
    checkPeriod: 60 // Проверка каждые 60 секунд
});

module.exports = studentCache;