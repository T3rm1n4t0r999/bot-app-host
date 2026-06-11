const { ForbiddenError, AppError, UnauthorizedError} = require("../Utils/Errors");
const errorHandler = require("../Utils/ErrorHandler");
const logger = require("../Logger/Logger");
/**
 * Проверка роли студента
 * @param allowedRoles
 * @returns {(function(*, *): Promise<void>)|*}
 */
module.exports = function(allowedRoles = ['student', 'premium', 'guest']) {
    return async (ctx, next) => {
        try {
            if (!ctx.state.student) {
                throw new AppError('Please complete registration first. Use /start');
            }

            if (!allowedRoles.includes(ctx.state.student.role)) {
                throw new UnauthorizedError('Access denied. Your role does not have permission to access this feature.');
            }

            await next();
        } catch (error) {
            await errorHandler(ctx, error);
        }
    };
};