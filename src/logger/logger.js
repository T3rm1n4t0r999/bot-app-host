// logger/logger.js
const pino = require('pino');

// Создаем логгер с конфигурацией для enterprise
const logger = pino({
        level: process.env.LOG_LEVEL || 'info',
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
        formatters: {
            level: (label) => ({ level: label }),
            bindings: (bindings) => ({
                pid: bindings.pid,
                hostname: bindings.hostname,
                service: 'telegram-bot',
                environment: process.env.NODE_ENV || 'development'
            })
        },
        serializers: {
            error: pino.stdSerializers.err,
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res
        },
        // Асинхронное логирование для production
        transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
            }
        } : undefined
    },
    process.env.NODE_ENV === 'production' ? pino.destination({ sync: false }) : undefined
);

// Дополнительные методы для бизнес-логики
logger.audit = function(action, userId, resource, meta = {}) {
    this.info(`AUDIT: ${action}`, {
        auditAction: action,
        auditUser: userId,
        auditResource: resource,
        ...meta
    });
};

logger.metric = function(name, value, dimensions = {}) {
    this.info(`METRIC: ${name}`, {
        metricName: name,
        metricValue: value,
        metricDimensions: dimensions
    });
};

module.exports = logger;