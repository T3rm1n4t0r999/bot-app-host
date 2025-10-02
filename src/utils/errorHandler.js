const { ValidationError, NotFoundError, AppError } = require('../utils/errors');
const {UnauthorizedError} = require("./errors");

const errorHandler = (ctx, error) => {
    console.log(error);
    const errorMessages = {
        [UnauthorizedError.name]: '❌ У вас нет доступа к этому разделу',
        [ValidationError.name]: '❌ Неверные данные. Проверьте ввод.',
        [NotFoundError.name]: '❌ Пользователь не найден. Используйте /start для регистрации.',
        [AppError.name]: '❌ Произошла ошибка. Попробуйте позже.',
        default: '❌ Неизвестная ошибка. Обратитесь в поддержку.'
    };

    const message = errorMessages[error.name] || errorMessages.default;
    return ctx.reply(message);
};

module.exports = errorHandler;