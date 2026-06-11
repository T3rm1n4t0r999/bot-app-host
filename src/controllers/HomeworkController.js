const HomeworkService = require("../services/HomeworkService");
const KeyboardFactory = require("../services/KeyboardFactory");
const logger = require("../logger/Logger");
const homeworkService = new HomeworkService();
const RedisService = require("../services/RedisService");
const StudentService = require("../services/StudentService");
const studentService = new StudentService();
const entityType = RedisService.ENTITY_TYPES.Homework;

class HomeworkController {

    /**
     * Обработка callback queries для домашних заданий
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;

            if (callbackData.startsWith('homework_page:')) {
                const page = parseInt(callbackData.split(':')[1]);
                await HomeworkController.showHomeworks(ctx, page);
            } else if (callbackData === 'back_to_homework') {
                await HomeworkController.showHomeworks(ctx, 1);
            }else if (callbackData.startsWith('view_homework:')) {
                const homeworkId = parseInt(callbackData.split(':')[1]);
                await HomeworkController.showHomeworkTask(ctx, homeworkId);
            }else if (callbackData === 'page_info') {
                await ctx.answerCallbackQuery('Это номер страницы');
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Показать все доступные домашние задания
     */
    static async showHomeworks(ctx, page = 1) {
        try {
            const student = ctx.state?.student;
            if (!student) {
                const msg = '❌ Ошибка: не удалось определить студента.';
                return ctx.callbackQuery ? ctx.answerCallbackQuery(msg) : ctx.reply(msg);
            }

            const homeworks = await homeworkService.getStudentHomeworks(student);

            if (!homeworks || homeworks.length === 0) {
                const msg = 'У вас пока нет домашних заданий.\nРешите урок, чтобы получить домашнее задание.';
                if (ctx.callbackQuery) {
                    await ctx.answerCallbackQuery(msg, { show_alert: true });
                    // Опционально: можно отредактировать сообщение, чтобы показать текст
                    await ctx.editMessageText(msg);
                } else {
                    await ctx.reply(msg);
                }
                return;
            }

            const message = '*Выберите домашнее задание:*';
            const keyboard = KeyboardFactory.createHomeworksKeyboard(homeworks, page);

            const options = {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            };

            if (ctx.callbackQuery) {
                // Используем универсальный подход или editMessageText, если уверены, что предыдущее сообщение было текстовым
                await ctx.editMessageText(message, options);
                await ctx.answerCallbackQuery();
            } else {
                await ctx.reply(message, options);
            }
        } catch (error) {
            logger.error('Error while getting homeworks', { error: error.message });

            const errorMsg = '❌ Произошла ошибка при загрузке домашних заданий.';
            if (ctx.callbackQuery) {
                await ctx.answerCallbackQuery(errorMsg, { show_alert: true }).catch(() => {});
            } else {
                await ctx.reply(errorMsg).catch(() => {});
            }
        }
    }

    static async updateMessage(ctx, text, keyboard) {
        const currentMsg = ctx.callbackQuery?.message;
        const isCurrentPhoto = !!currentMsg?.photo;

        if (isCurrentPhoto) {
            try {
                await ctx.deleteMessage();
                await ctx.reply(text, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
                return await ctx.answerCallbackQuery();

            } catch (e) {

            }
        }

        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    /**
     * Показать задание домашней работы
     */
    static async showHomeworkTask(ctx, homeworkId){
        try {
            const homework = await homeworkService.getHomework(homeworkId);
            if (!homework || homework.length === 0) {
                await ctx.answerCallbackQuery('Домашнее задание отсутсвует');
                return;
            }
            const lastBestAttempt = await studentService.findLastBestResult(student?.id,'homework', homeworkId);

            let message = '';
            if (lastBestAttempt){
                const homeworkAttemptMessage = homework.maxAttempts < 1 ? lastBestAttempt.attempt : `${lastBestAttempt.attempt} / ${homework.maxAttempts}`;
                message = 'Домашнее задание:\n\n'+
                    `📖 *Название*: ${homework.title}\n`+
                    `🏆 *Баллы*: ${lastBestAttempt.points} / ${homework.maxScore}\n`+
                `*Попыток*: ${homeworkAttemptMessage}`;
            }else{
                message = 'Домашнее задание:\n\n'+
                    `📖 *Название*: ${homework.title}\n`+
                    `🏆 *Максимально баллов*: ${homework.maxScore}\n`+
                `*Максимально попыток*: ${homework.maxAttempts < 1 ? 'Не ограничено' : homework.maxAttempts}`;
            }
            const blocked = task.maxAttempts === lastBestAttempt?.attempt;
            const keyboard = KeyboardFactory.createHomeworkTaskKeyboard(homeworkId, 'homework');
            await this.updateMessage(ctx, message, keyboard);
            await ctx.answerCallbackQuery();
        } catch (e) {
            logger.error('Error while showing homework ', e);
            throw e;
        }
    }

    /**
     * Вернуться к домашним работам
     */
    static async backToHomework(ctx, homeworkId) {
        await HomeworkController.showHomeworkTask(ctx, homeworkId);
    }
}

module.exports = HomeworkController;