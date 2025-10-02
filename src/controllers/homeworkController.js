class HomeworkController {
    static async getHomework(ctx) {
        try {
            await ctx.reply('Скоро здесь будут ваши домашние задания!');
        }catch (error) {
            console.log('Ошибка в HomeController', error);
        }
    }
}

module.exports = HomeworkController;