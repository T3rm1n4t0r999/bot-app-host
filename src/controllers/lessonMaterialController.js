const {InlineKeyboard} = require("grammy");

class LessonMaterialController {
    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_lesson_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await this.showLessonMaterials(ctx, lessonId);
            } else if (callbackData.startsWith('view_lesson_material:')) {
                const materialId = parseInt(callbackData.split(':')[1]);
                await this.showLessonMaterial(ctx, materialId);
            } else if(callbackData.startsWith('back_to_lesson_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await this.backToMaterials(ctx, lessonId);
            }
        } catch (error) {
            console.error('Ошибка в lessonMaterialsController::handleCallbackQuery:', error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка');
        }
    }

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

            await LessonController.showLessonMaterials(ctx, lessonId);
        } catch (error) {
            console.error('Ошибка в backToMaterials:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате к модулям');
        }
    }

}

module.exports = LessonMaterialController;