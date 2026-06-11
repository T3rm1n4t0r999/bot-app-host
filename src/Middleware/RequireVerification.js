// const {NotFoundError, UnauthorizedError, ValidationError} = require("../Utils/errors");
// const StudentService = require("../Services/studentService");
// const errorHandler = require("../Utils/errorHandler");
// const Logger = require("../Logger/Logger");
// // Создаем экземпляр сервиса
// const studentService = new StudentService();
//
// /**
//  * Проверка регистрации пользователя
//  * @returns {(function(*, *): Promise<void>)|*}
//  */
// function requireVerification() {
//     return async (ctx, next) => {
//         const telegramId = ctx.from?.id?.toString();
//
//         if (!telegramId) {
//             throw new ValidationError('Telegram ID not provided');
//         }
//
//         try {
//             const student = await studentService.getStudentProfile(telegramId);
//
//             if (!student) {
//                 throw new NotFoundError('Telegram ID not found');
//             }
//
//             // Инициализация state если не существует
//             ctx.state = ctx.state || {};
//             ctx.state.student = student;
//
//             await next();
//
//         } catch (error) {
//             Logger.error('Error in Middleware.requireRegistration', error);
//             await errorHandler(ctx, error);
//         }
//     };
// }
//
// module.exports = requireVerification;