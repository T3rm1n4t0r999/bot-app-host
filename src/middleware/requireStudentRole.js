const { ForbiddenError, AppError, UnauthorizedError} = require("../utils/errors");
const errorHandler = require("../utils/errorHandler");
const logger = require("../logger/logger");

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