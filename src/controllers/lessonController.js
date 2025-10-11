const KeyboardFactory = require("../services/keyboardFactory");
const LessonService = require("../services/lessonService");
const ModuleController = require("../controllers/ModuleController");
const {InlineKeyboard} = require("grammy");
const CourseController = require("./courseController");

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
            }else if (callbackData.startsWith('view_learning_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLearningMaterials(ctx, lessonId);
            }else if (callbackData.startsWith('view_lesson_assignment:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonAssignment(ctx, lessonId);
            }else if (callbackData.startsWith('view_material:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.showLessonMaterial(ctx, lessonId);
            }else if(callbackData.startsWith('back_to_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonController.backToMaterials(ctx, lessonId);
            }
        } catch (error) {
            console.error('Ошибка в handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    static async showLessonAssignment(ctx, lessonId) {
        try {
            const assignments = await lessonService.showLessonAssignment(lessonId);
            const keyboard = new InlineKeyboard().text('🔙 К уроку', `view_lesson:${lessonId}`);
            if (!assignments || assignments.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет заданий.');
                return;
            }
            const assignment = assignments[0]

            let message = '📚 Задания урока:\n\n';
            message += `${assignment.title}\n
            ${assignment.description}\n
            ${assignment.maxScore}\n
            ${assignment.difficulty}\n`;

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



    static async showLearningMaterials(ctx, lessonId) {
        try {
            // Получаем материалы урока
            const materials = await lessonService.getLearningMaterialsByLessonId(lessonId);
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
            console.error('Error showing learning materials:', error);
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

    static async backToMaterials(ctx, lessonId) {
        try {
            const lesson = await lessonService.getLessonById(lessonId);
            if (!lesson) {
                await ctx.answerCallbackQuery('❌ Урок не найден');
                return;
            }

            await LessonController.showLearningMaterials(ctx, lessonId);
        } catch (error) {
            console.error('Ошибка в backToMaterials:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к модулям');
        }
    }
}

module.exports = LessonController;