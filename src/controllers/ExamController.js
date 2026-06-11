const ExamService = require("../services/ExamService");
const KeyboardFactory = require("../services/KeyboardFactory");
const logger = require("../logger/Logger");
const examService = new ExamService();
const RedisService = require("../services/RedisService");
const StudentService = require("../services/StudentService");
const studentService = new StudentService();
const entityType = RedisService.ENTITY_TYPES.Exam;

class ExamController {

    /**
     * Обработка callback queries для контрольных работ
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;

            if (callbackData.startsWith('exam_page:')) {
                const page = parseInt(callbackData.split(':')[1]);
                await ExamController.showExams(ctx, page);
            } else if (callbackData === 'back_to_exam') {
                await ExamController.showExams(ctx, 1);
            }else if (callbackData.startsWith('view_exam:')) {
                const examId = parseInt(callbackData.split(':')[1]);
                await ExamController.showExamTask(ctx, examId);
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
    static async showExams(ctx, page = 1) {
        try {
            const student = ctx.state?.student;
            if (!student) {
                const msg = '❌ Ошибка: не удалось определить студента.';
                return ctx.callbackQuery ? ctx.answerCallbackQuery(msg) : ctx.reply(msg);
            }

            const exams = await examService.getStudentExams(student);

            if (!exams || exams.length === 0) {
                const msg = 'У вас пока нет контрольных работ.\nПройдите модуль, чтобы получить контрольную работу.';
                if (ctx.callbackQuery) {
                    await ctx.answerCallbackQuery(msg, { show_alert: true });
                    await ctx.editMessageText(msg);
                } else {
                    await ctx.reply(msg);
                }
                return;
            }

            const message = '*Выберите контрольную работу:*';
            const keyboard = KeyboardFactory.createExamsKeyboard(exams, page);

            const options = {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            };

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, options);
                await ctx.answerCallbackQuery();
            } else {
                await ctx.reply(message, options);
            }
        } catch (error) {
            logger.error('Error while getting exams', { error: error.message });

            const errorMsg = '❌ Произошла ошибка при загрузке контрольных работ.';
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
    static async showExamTask(ctx, examId){
        try {
            const exam = await examService.getExam(examId);
            if (!exam || exam.length === 0) {
                await ctx.answerCallbackQuery('Контрольная работа отсутсвует');
                return;
            }
            const time_limit = exam.timeLimit ? exam.timeLimit + ' мин.': 'Не ограничено';

            const lastBestAttempt = await studentService.findLastBestResult(student?.id,'exam', exam);

            let message = '';
            if (lastBestAttempt){
                const examAttemptMessage = exam.maxAttempts < 1 ? lastBestAttempt.attempt : `${lastBestAttempt.attempt} / ${exam.maxAttempts}`;
                message = 'Контрольная работа:\n\n'+
                    `📖 *Название*: ${exam.title}\n`+
                    `🏆 *Баллы*: ${lastBestAttempt.points} / ${exam.maxScore}\n`+
                    `⏳ *Время*: ${time_limit}\n`;
                    `*Попыток*: ${examAttemptMessage}`;
            }else{
                message = 'Контрольная работа:\n\n'+
                    `📖 *Название*: ${exam.title}\n`+
                    `🏆 *Максимально баллов*: ${exam.maxScore}\n`+
                    `⏳ *Время*: ${time_limit}\n`;
                    `*Максимально попыток*: ${exam.maxAttempts < 1 ? 'Не ограничено' : exam.maxAttempts}`;
            }

            const blocked = task.maxAttempts === lastBestAttempt?.attempt;
            const keyboard = KeyboardFactory.createExamTaskKeyboard(examId, 'exam');
            await this.updateMessage(ctx, message, keyboard);
            await ctx.answerCallbackQuery();
        } catch (e) {
            logger.error('Error while showing exam ', e);
            throw e;
        }
    }

    /**
     * Вернуться к домашним работам
     */
    static async backToExam(ctx, examId) {
        await ExamController.showExamTask(ctx, examId);
    }
}

module.exports = ExamController;