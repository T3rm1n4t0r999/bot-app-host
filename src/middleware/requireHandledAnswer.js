const QuestionController = require("../controllers/QuestionController");

function requireHandledAnswer(){
    return async(ctx,next) => {
        const handled = await QuestionController.handleTextAnswer(ctx);
        if (!handled) await next();
    }
}

module.exports = requireHandledAnswer;