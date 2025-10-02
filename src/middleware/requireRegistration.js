const {NotFoundError, UnauthorizedError} = require("../utils/errors");
const StudentService = require("../services/studentService");
const errorHandler = require("../utils/errorHandler");

function requireRegistration() {
    return async (ctx, next) => {
        const telegramId = ctx.from?.id?.toString();

        if (!telegramId) {
            throw new ValidationError('Telegram ID not provided');
        }

        try {
            const student = await StudentService.getStudentProfile(telegramId);

            if (!student) {
                throw new NotFoundError('Telegram ID not found');
            }

            // Инициализация state если не существует
            ctx.state = ctx.state || {};
            ctx.state.student = student;

            await next();

        } catch (error) {
            await errorHandler(ctx, error);
        }
    };
}

module.exports = requireRegistration;