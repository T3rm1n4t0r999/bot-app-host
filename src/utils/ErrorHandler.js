const { ValidationError, NotFoundError, AppError } = require('./Errors');
const {UnauthorizedError} = require("./Errors");

const errorHandler = (ctx, error) => {
    console.log(error);
    const errorMessages = {
        [UnauthorizedError.name]: '❌ У вас нет доступа к этому разделу',
        [ValidationError.name]: '❌ Неверные данные. Проверьте ввод.',
        [NotFoundError.name]: '❌ Пользователь не найден. Используйте /start ваш_код для входа.',
        [AppError.name]: '❌ Произошла ошибка. Попробуйте позже.',
        default: '❌ Неизвестная ошибка. Обратитесь в поддержку.'
    };

    const message = errorMessages[error.name] || errorMessages.default;
    return ctx.reply(message);
};

module.exports = errorHandler;