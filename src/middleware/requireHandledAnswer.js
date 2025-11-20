const LessonTaskController = require("../controllers/lessonTaskController");

function requireHandledAnswer(){
    return async(ctx,next) => {
        const handled = await LessonTaskController.handleTextAnswer(ctx);
        if (!handled) await next();
    }
}

module.exports = requireHandledAnswer;