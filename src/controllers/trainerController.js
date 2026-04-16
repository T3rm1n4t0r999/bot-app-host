const Logger = require("../logger/logger")
const KeyboardFactory = require("../services/keyboardFactory");
const TrainerService = require("../services/trainerService");

const trainerService = new TrainerService();

class TrainerController {
    static async handleCallbackQuery(ctx){
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('trainers_page')) {
                const page = parseInt(callbackData.split(':')[1]);
                await TrainerController.showTrainers(ctx, page);
            } else if(callbackData.startsWith('back_to_trainer_menu:')) {
                await TrainerControlle.backToTrainer(ctx);
            }else if(callbackData.startsWith('start_trainer:')) {
                const courseId = parseInt(callbackData.split(':')[1]);
                await TrainerControlle.startTrainer(ctx, courseId);
            }
        } catch (error) {
            Logger.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    static async showTrainers(ctx, page = 1){
        try {
            const trainers = await trainerService.getAllTrainers();
            if (trainers.length === 0) {
                if (ctx.callbackQuery) {
                    await ctx.answerCallbackQuery('📚 На данный момент тренажеры отсутствуют.');
                    return
                }
                return ctx.reply('📚 На данный момент тренажеры отсутствуют.');
            }
            const message = "Выберите тренажер:";
            const keyboard = await KeyboardFactory.createTrainersKeyboard(trainers, page);
            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {reply_markup: keyboard});
                await ctx.answerCallbackQuery();
            } else await ctx.reply(message, {reply_markup: keyboard});
        } catch (e) {
            Logger.error(e);
            await ctx.answerCallbackQuery("Произошла ошибка при загрузке тренажеров.");
        }
    }


    static async startTrainer(ctx, courseId){

    }
}

module.exports = TrainerController;