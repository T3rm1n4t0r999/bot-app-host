
const StudentService = require('../Services/StudentService');
const errorHandler = require("../Utils/ErrorHandler");
const keyboardFactory = require("../Services/KeyboardFactory");
const logger = require('../Logger/Logger');
const InvitationService = require("../Services/InvitationService");
const {NotFoundError} = require("../Utils/Errors");
const {InlineKeyboard} = require("grammy");
// Создаем экземпляр сервиса
const studentService = new StudentService();
const invitationService = new InvitationService();
class StudentController {


    static async handleCallbackQuery(ctx) {
        const callbackData = ctx.callbackQuery.data;

        if (callbackData.startsWith('show_results_menu')) {
            await StudentController.showResultsMenu(ctx);
        }else if (callbackData.startsWith('show_all_results')) {
            await StudentController.showAllResults(ctx, 1);
        } else if (callbackData.startsWith('show_checked_results')) {
            await StudentController.showCheckedResults(ctx, 1);
        } else if (callbackData.startsWith('show_unchecked_results')) {
            await StudentController.showUncheckedResults(ctx, 1);
        } else if (callbackData.startsWith('results_page:')) {
            const parts = callbackData.split(':');
            const filterType = parts[1];
            const page = parseInt(parts[2]) || 1;
            await StudentController.showResultsByFilter(ctx, filterType, page);
        } else if (callbackData.startsWith('show_result:')) {
            const parts = callbackData.split(':');
            const attemptId = parseInt(parts[1]);
            const questionIndex = parts.length > 2 ? parseInt(parts[2]) : 0;
            await StudentController.showResultQuestion(ctx, attemptId, questionIndex);
        } else if (callbackData.startsWith('result_question:')) {
            const parts = callbackData.split(':');
            const attemptId = parseInt(parts[1]);
            const questionIndex = parseInt(parts[2]);
            await StudentController.showResultQuestion(ctx, attemptId, questionIndex);
        }

    }

    /**
     * Получение информации о студенте
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async showStudentInfo(ctx) {
        try {
            const student = ctx.state.student;
            const keyboard = keyboardFactory.createProfileKeyboard();

            const message =
                `Ваш профиль:\n\n`+
                `*Имя*: ${student.firstname}\n`+
                `*Баллы*: ${student.score}\n`


            if(ctx.callbackQuery){
                await ctx.editMessageText(message, {reply_markup: keyboard, parse_mode: 'Markdown'});
                await ctx.answerCallbackQuery()
            }
            else await ctx.reply(message, {reply_markup: keyboard, parse_mode: 'Markdown'});

        } catch (error) {
            logger.error('Error in StudentController.showStudentInfo:', error);
            await errorHandler(ctx, error);
        }
    }

    static async showResultsMenu(ctx) {
        const student = ctx?.state?.student;
        const studentId = student?.id;

        const bestAttempts = await studentService.getBestAttempts(studentId);
        const total = bestAttempts.length;
        const checked = bestAttempts.filter(a => a.checked).length;
        const unchecked = bestAttempts.filter(a => !a.checked).length;

        const message = `*Меню результатов*\n` +
            `✅ Проверено: ${checked}\n` +
            `⏳ Ожидают проверки: ${unchecked}\n` +
            `📊 Всего заданий: ${total}\n\n` +
            `(учитываются только новые лучшие попытки)`;

        const keyboard = keyboardFactory.createResultsMenuKeyboard();
        if(ctx.callbackQuery) {
            await ctx.editMessageText(message,{reply_markup: keyboard, parse_mode: 'Markdown'});
            await ctx.answerCallbackQuery();
        }
        else await ctx.reply(message, {reply_markup: keyboard, parse_mode: 'Markdown'});
    }

    static async showAllResults(ctx, page = 1) {
        await StudentController.showResultsByFilter(ctx, 'all', page);
    }

    static async showCheckedResults(ctx, page = 1) {
        await StudentController.showResultsByFilter(ctx, 'checked', page);
    }

    static async showUncheckedResults(ctx, page = 1) {
        await StudentController.showResultsByFilter(ctx, 'unchecked', page);
    }

    static async showResultsByFilter(ctx, filterType, page = 1) {
        const studentId = ctx.state.student.id;
        const bestAttempts = await studentService.getBestAttempts(studentId);
        let filtered;
        let header;
        if (filterType === 'all') {
            filtered = bestAttempts;
            header = '📋 *Лучшие результаты*';
        } else if (filterType === 'checked') {
            filtered = bestAttempts.filter(a => a.checked);
            header = '✅ *Проверенные результаты*';
        } else if (filterType === 'unchecked') {
            filtered = bestAttempts.filter(a => !a.checked);
            header = '⏳ *Ожидают проверки*';
        }

        if (filtered.length === 0) {
            await ctx.answerCallbackQuery('Нет результатов');
            return;
        }

        const totalPages = Math.ceil(filtered.length / 4);
        const message = `${header}\n\nСтраница ${page} из ${totalPages}`;
        const keyboard = keyboardFactory.createStudentResultsKeyboard(filtered, filterType, page, 4);

        try {
            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
        } catch (e) {
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });
        }
        await ctx.answerCallbackQuery();
    }

    /**
     * Показать таблицу лидеров
     * @param ctx
     * @returns {Promise<void>}
     */
    static async showLeaderboard(ctx) {
        const student = ctx.state.student;
        const limit = 10;
        const leaderboard = await studentService.getLeaderboard(limit)
        if (!leaderboard) {
            await ctx.answerCallbackQuery("Топ студентов пуст!");
            return
        }
        const keyboard = keyboardFactory.createLeaderboardKeyboard(leaderboard, student);
        const message = 'Топ студентов';
        await ctx.editMessageText(message, { reply_markup: keyboard });
        await ctx.answerCallbackQuery();
    }

    /**
     * Обработка команды /start
     * @param ctx
     * @returns {Promise<void>}
     */
    static async handleStart(ctx) {
        try {
            const telegramId =ctx?.from?.id.toString();
            const isRegistered = await studentService.isUserRegistered(telegramId);
            if (!isRegistered) {
                    const student = await StudentController.handleInvitations(ctx)
                    const keyboard = keyboardFactory.createMainMenuKeyboard();
                    if (student) {
                        await ctx.reply(
                            '✅ Добро пожаловать! Выберите действие:',
                            { reply_markup: keyboard }
                        );
                    }
            }
        } catch (error) {
            logger.error('Error in StudentController.handleStart', error);
            await errorHandler(ctx, error);
        }
    }

    static async handleInvitations(ctx){
        const commandText = ctx.message.text;
        const token = commandText.split(' ')[1];

        if (!token) {
            await ctx.reply('Пожалуйста, укажите токен.\n' +
                'Пример: /token ваш_код');
            return;
        }
        const botUsername = '@' + ctx.me.username;
        const invitation = await invitationService.verifyStudentInvitation(token, botUsername);

        if (!invitation) {
            await ctx.reply(
                'Токен организации неверный или не существует.'
            )
            return;
        }
        const orgId = invitation?.organization_id;
        const student = await studentService.registerStudent(ctx.from, orgId);
        await studentService.assignAutoCourses(student);
        if (invitation?.group_id) {
            await studentService.assignGroupById(student, invitation?.group_id);
        }
        return student;
    }

    static async acceptInvitation(ctx){
        try{
            const telegramId =ctx?.from?.id.toString();
            const isRegistered = await studentService.isUserRegistered(telegramId);
            if (!isRegistered) {
                const student = await StudentController.handleInvitations(ctx)
                const keyboard = keyboardFactory.createMainMenuKeyboard();
                if (student) {
                    await ctx.reply(
                        '✅ Добро пожаловать! Выберите действие:',
                        { reply_markup: keyboard }
                    );
                }
            }
        } catch (error) {
            logger.error('Error in StudentController.acceptInvitation', error);
            await errorHandler(ctx, error);
        }
    }

    static async joinGroup(ctx) {
        try{
            const student = ctx?.state?.student;
            const commandText = ctx.message.text;

            const code = commandText.split(' ')[1];
            if (!code) {
                await ctx.reply('Пожалуйста, укажите код.\n' +
                    'Пример: /join ваш_код');
                return;
            }

            const group = await studentService.getGroupByCode(code);

            if (!group) {
                await ctx.reply('Код группы неверный.')
                return;
            }

            await studentService.assignGroupById(student, group?.id);
            const keyboard = keyboardFactory.createMainMenuKeyboard();
            await ctx.reply(
                `Вы вступили в группу ${group.name}!`,
                { reply_markup: keyboard }
            );
        } catch (error) {
            logger.error('Error in StudentController.joinGroup', error);
            await errorHandler(ctx, error);
        }
    }

    static async showResultQuestion(ctx, attemptId, questionIndex = 0) {
        try {
            const studentId = ctx.state.student.id;
            const attempt = await studentService.getAttemptDetails(attemptId);

            if (!attempt || String(attempt.studentId) !== String(studentId)) {
                await ctx.answerCallbackQuery('❌ Результат не найден или недоступен');
                return;
            }

            const task = attempt.task;
            if (!task || !task.questions?.length) {
                await ctx.answerCallbackQuery('❌ Нет данных о задании');
                return;
            }

            const questions = task.questions.sort((a, b) => (a.order || 0) - (b.order || 0));
            const totalQuestions = questions.length;
            const safeIndex = Math.max(0, Math.min(questionIndex, totalQuestions - 1));
            const q = questions[safeIndex];

            const answers = attempt.answers || [];
            const manualScores = attempt.metadata?.manual_scores || {};
            const explanations = attempt.metadata?.free_text_explanations || {};

            const getUserAnswer = (questionId) => {
                const entry = answers.find(a => a.question_id == questionId);
                return entry ? entry.answer : null;
            };

            // Форматирование ответа без Markdown
            const formatAnswer = (question, userAnswer) => {
                if (userAnswer === null || userAnswer === undefined) return 'Нет ответа';
                switch (question.questionType) {
                    case 'text':
                    case 'free_text':
                        return String(userAnswer);
                    case 'single_choice': {
                        const opt = question.options?.[userAnswer]?.text;
                        return opt || 'Неизвестный вариант';
                    }
                    case 'multiple_choice': {
                        if (!Array.isArray(userAnswer)) return String(userAnswer);
                        const selected = userAnswer
                            .map(idx => question.options?.[idx]?.text)
                            .filter(Boolean);
                        return selected.length ? selected.join(', ') : '-';
                    }
                    default:
                        return String(userAnswer);
                }
            };

            // Правильный ответ без Markdown
            const getCorrectAnswer = (question) => {
                if (!question.correctAnswers?.length) return 'Не указан';
                switch (question.questionType) {
                    case 'text':
                    case 'free_text': {
                        const texts = question.correctAnswers
                            .map(idx => question.options?.[idx]?.text)
                            .filter(Boolean);
                        return texts.length ? texts.join(', ') : '-';
                    }
                    case 'single_choice':
                        return question.options?.[question.correctAnswers[0]]?.text || '-';
                    case 'multiple_choice': {
                        const labels = question.correctAnswers
                            .map(idx => question.options?.[idx]?.text)
                            .filter(Boolean);
                        return labels.length ? labels.join(', ') : '-';
                    }
                    default:
                        return JSON.stringify(question.correctAnswers);
                }
            };

            const userAnswer = getUserAnswer(q.id);
            const maxPoints = q.points || 0;
            const isFreeText = q.questionType === 'free_text';

            let earnedPoints = 0;
            let pointText = '';
            let explanationText = '';

            if (isFreeText) {
                earnedPoints = manualScores[q.id] !== undefined ? manualScores[q.id] : 0;
                pointText = `${earnedPoints} / ${maxPoints}`;
                const expl = explanations[q.id];
                if (expl) explanationText = `\n  Пояснение: ${expl}`;
            } else {
                const correct = StudentController.isAnswerCorrect(q, userAnswer);
                earnedPoints = correct ? maxPoints : 0;
                pointText = `${earnedPoints} / ${maxPoints}`;
                explanationText = `\n  Правильный ответ: ${getCorrectAnswer(q)}`;
            }

            // Сборка сообщения без Markdown
            let message = `📊 Результат: ${task.title || 'Без названия'}\n`;
            message += `Тип: ${StudentController.typeLabel(attempt.progressableType)}\n`;
            message += `Общий балл: ${attempt.points} / ${attempt.maxPoints}\n`;
            message += `Статус: ${attempt.checked ? '✅ Проверено' : '⏳ Ожидает проверки'}\n\n`;
            message += `Вопрос ${safeIndex + 1}/${totalQuestions}:\n`;
            message += `${q.question}\n`;
            message += `  Ответ: ${formatAnswer(q, userAnswer)}\n`;
            message += `  Баллы: ${pointText}${explanationText}`;

            // Клавиатура
            const keyboard = new InlineKeyboard();
            const navRow = [];
            if (safeIndex > 0) navRow.push(InlineKeyboard.text('◀️ Предыдущий', `result_question:${attemptId}:${safeIndex - 1}`));
            if (safeIndex < totalQuestions - 1) navRow.push(InlineKeyboard.text('▶️ Следующий', `result_question:${attemptId}:${safeIndex + 1}`));
            if (navRow.length) keyboard.row(...navRow);
            keyboard.text('🔙 К результатам', 'show_checked_results');

            const msgOptions = {
                // parse_mode убран, сообщение отправляется как обычный текст
                reply_markup: keyboard,
            };

            if (ctx.callbackQuery) {
                try { await ctx.editMessageText(message, msgOptions); }
                catch (e) { await ctx.reply(message, msgOptions); }
            } else {
                await ctx.reply(message, msgOptions);
            }
            await ctx.answerCallbackQuery();

        } catch (error) {
            console.error(error);
            logger.error('Error in showResultQuestion:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке результата');
        }
    }
    // Статические вспомогательные методы
    static typeLabel(type) {
        const labels = {
            lesson_task: 'Задание урока',
            homework: 'Домашнее задание',
            exam: 'Контрольная работа'
        };
        return labels[type] || type;
    }

    static isAnswerCorrect(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined) return false;
        if (!question.correctAnswers || question.correctAnswers.length === 0) return false;
        switch (question.questionType) {
            case 'text': {
                const correctTexts = question.correctAnswers
                    .map(idx => question.options?.[idx]?.text?.trim().toLowerCase())
                    .filter(Boolean);
                const userText = String(userAnswer).trim().toLowerCase();
                return correctTexts.includes(userText);
            }
            case 'single_choice':
                return String(userAnswer) === String(question.correctAnswers[0]);
            case 'multiple_choice':
                if (!Array.isArray(userAnswer)) return false;
                const correct = question.correctAnswers.map(String).sort();
                const given = userAnswer.map(String).sort();
                return JSON.stringify(correct) === JSON.stringify(given);
            default:
                return false;
        }
    }

}



module.exports = StudentController;