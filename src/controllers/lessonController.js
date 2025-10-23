const KeyboardFactory = require("../services/keyboardFactory");
const LessonService = require("../services/lessonService");
const ModuleController = require("../controllers/ModuleController");
const {InlineKeyboard} = require("grammy");
const CourseController = require("./courseController");
const RedisService = require("../services/redisService");
const StudentProgressRepository = require("../repository/studentProgressRepository");

const lessonService = new LessonService();

class LessonController {
    /**
     * Показать детали урока
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} lessonId - ID урока
     */
    static async showLessonDetails(ctx, lessonId) {
        try {
            const lesson = await lessonService.getLessonById(lessonId);

            if (!lesson) {
                await ctx.answerCallbackQuery('❌ Урок не найден');
                return;
            }

            let message = `📚 **${lesson.title}**\n\n`;
            if (lesson.description) {
                message += `${lesson.description}`;
            }

            const keyboard = KeyboardFactory.createLessonNavigationKeyboard(lesson.moduleId, lesson.id);

            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Ошибка в showLessonDetails:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке урока');
        }
    }

    /**
     * Вернуться к урокам модуля
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param {number} moduleId - ID модуля
     */
    static async backToLessons(ctx, moduleId) {
        try {
            await ModuleController.showModuleLessons(ctx, moduleId);
        } catch (error) {
            console.error('Ошибка в backToLessons:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к урокам');
        }
    }

    /**
     * Обработка callback queries для курсов и модулей
     * @param {import('grammy').Context} ctx - Контекст бота
     */
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_lesson:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonDetails(ctx, lessonId);
            } else if (callbackData.startsWith('back_to_lessons:')) {
                const moduleId = parseInt(callbackData.split(':')[1]);
                await LessonController.backToLessons(ctx, moduleId);
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    static async showLessonTask(ctx, lessonId) {
        try {
            const tasks = await lessonService.showLessonTask(lessonId);
            if (!tasks || tasks.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет заданий.');
                return;
            }
            ctx.lessonId = lessonId;
            const task = tasks[0]
            const keyboard = new InlineKeyboard().text('🔙 К уроку', `view_lesson:${lessonId}`).text('Начать выполнение', `view_task_questions:${task.id}`);
            let message = '📚 Задания урока:\n\n';
            message += `${task.title}\n${task.description}\n${task.maxScore}\n${task.difficulty}\n`;
            // Отправляем основное сообщение со списком материалов
            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (e) {
            console.error(e);
        }
    }



    static async showLessonMaterials(ctx, lessonId) {
        try {
            // Получаем материалы урока
            console.log('Error showing lesson materials:');
            const materials = await lessonService.getLessonMaterialsByLessonId(lessonId);
            const keyboard = new InlineKeyboard();
            if (!materials || materials.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет обучающих материалов.');
                return;
            }
            // Сортируем материалы по порядку
            const sortedMaterials = materials.sort((a, b) => a.order - b.order);

            // Формируем сообщение с названиями материалов
            let message = `📚 Обучающие материалы урока:`;

            sortedMaterials.forEach((material, index) => {
                keyboard.text(material.title, `view_material:${material.id}`).row();
            });
            keyboard.text('🔙 К уроку', `view_lesson:${lessonId}`).row();
            // Отправляем основное сообщение со списком материалов
            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Error showing lesson materials:', error);
            await ctx.reply('❌ Произошла ошибка при загрузке материалов урока.');
        }
    }

    static async showLessonMaterial(ctx, materialId) {
        try {
            const material = await lessonService.getMaterialById(materialId);
            let message = `Название урока: ${material.title}\nОписание урока: ${material.content}`;
            const keyboard = new InlineKeyboard().text('К материалам', `back_to_materials:${material.lessonId}`).row();
            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });
            await ctx.answerCallbackQuery();
        } catch (e) {
        }
    }

    static async showTaskQuestions(ctx, lessonTaskId) {
        try {
            const taskQuestions = await lessonService.getTaskQuestionsByLessonTaskId(lessonTaskId);
            if (!taskQuestions || taskQuestions.length === 0) {
                await ctx.answerCallbackQuery('Вопросов нет');
                return;
            }

            const ordered = taskQuestions.sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
            const questionIds = ordered.map(q => q.id);
            const userId = ctx.from.id.toString();
            await RedisService.saveTaskProgress(userId, lessonTaskId, questionIds, 0);

            await LessonController.navigateToQuestionIndex(ctx, lessonTaskId, 0);
        } catch (e) {
            console.error('Error in showTaskQuestions:', e);
            await ctx.answerCallbackQuery('Ошибка при открытии вопросов');
        }
    }

    static async backToMaterials(ctx, lessonId) {
        try {
            const lesson = await lessonService.getLessonById(lessonId);
            if (!lesson) {
                await ctx.answerCallbackQuery('❌ Урок не найден');
                return;
            }

            await LessonController.showLessonMaterials(ctx, lessonId);
        } catch (error) {
            console.error('Ошибка в backToMaterials:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к модулям');
        }
    }

}

module.exports = LessonController;