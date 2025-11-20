const {InlineKeyboard} = require("grammy");
const LessonService = require("../services/lessonService");
const KeyboardFactory = require("../services/keyboardFactory");
const lessonService = new LessonService();

/**
 * Обработка callback queries для курсов и модулей
 * @param {import('grammy').Context} ctx - Контекст бота
 */
class LessonMaterialController {
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonMaterialController.showLessonMaterials(ctx, lessonId);
            } else if (callbackData.startsWith('view_material:')) {
                const materialId = parseInt(callbackData.split(':')[1]);
                await LessonMaterialController.showLessonMaterial(ctx, materialId);
            } else if(callbackData.startsWith('back_to_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonMaterialController.backToMaterials(ctx, lessonId);
            }
        } catch (error) {
            console.error('Ошибка в lessonMaterialsController::handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

    /**
     * Показать материалы курса
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param lessonId - ID урока
     */
    static async showLessonMaterials(ctx, lessonId) {
        try {
            const materials = await lessonService.getLessonMaterialsByLessonId(lessonId);
            const keyboard = new InlineKeyboard();
            if (!materials || materials.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет обучающих материалов.');
                return;
            }

            const sortedMaterials = materials.sort((a, b) => a.order - b.order);

            let message = `📚 Обучающие материалы урока:`;

            sortedMaterials.forEach((material, index) => {
                keyboard.text(material.title, `view_material:${material.id}`).row();
            });
            keyboard.text('🔙 К уроку', `view_lesson:${lessonId}`).row();
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

    /**
     * Показать материалы курса
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param materialId - ID материала
     */
    static async showLessonMaterial(ctx, materialId) {
        try {
            const material = await lessonService.getByIdWithFiles(materialId);
            if (!material) {
                await ctx.answerCallbackQuery("❌ Материал не найден");
                return;
            }

            const message = `*${material.title}*\n\n${material.content || 'Описание отсутствует'}`;
            const lessonId = material.lessonId;
            const keyboard = KeyboardFactory.createLessonMaterialNavigationKeyboard(lessonId);

            await ctx.editMessageText(message, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });

            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Error showing lesson material:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке материала');
        }
    }

    /**
     * Вернуться к материалам урока
     * @param {import('grammy').Context} ctx - Контекст бота
     * @param lessonId - ID материала
     */
    static async backToMaterials(ctx, lessonId) {
        try {
            const lesson = await lessonService.getLessonById(lessonId);
            if (!lesson) {
                await ctx.answerCallbackQuery('❌ Урок не найден');
                return;
            }

            await LessonMaterialController.showLessonMaterials(ctx, lessonId);
        } catch (error) {
            console.error('Ошибка в backToMaterials:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к модулям');
        }
    }

}

module.exports = LessonMaterialController;