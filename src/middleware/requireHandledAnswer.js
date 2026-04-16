const QuestionController = require("../controllers/questionController");

/**
 * Проверка ожидания ответа на вопрос
 * @returns {(function(*, *): Promise<void>)|*}
 */
function requireHandledAnswer(){
    return async(ctx,next) => {
        const handled = await QuestionController.handleTextAnswer(ctx);
        if (!handled) await next();
    }
}

module.exports = requireHandledAnswer;