const { InlineKeyboard } = require("grammy");
const LessonService = require("../services/lessonService");
const KeyboardFactory = require("../services/keyboardFactory");
const lessonService = new LessonService();
const { InputFile } = require('grammy');
const path = require('path');
const fs = require('fs').promises;

class LessonMaterialController {

    // 🔥 Максимально надёжный хелпер: если редактирование не удалось — шлём новое сообщение
    static async safeSendText(ctx, text, keyboard, parseMode = 'Markdown') {
        try {
            // Пытаемся отредактировать текущее сообщение
            await ctx.editMessageText(text, {
                reply_markup: keyboard,
                parse_mode: parseMode
            });
        } catch (err) {
            // Ловим ВСЕ ошибки редактирования медиа-сообщений
            const errMsg = err?.message || err?.description || JSON.stringify(err);
            const isMediaError = errMsg.includes('no text in the message') ||
                errMsg.includes('message can\'t be edited') ||
                errMsg.includes('400');

            if (isMediaError) {
                // Не редактируем — удаляем старое и шлём новое
                try {
                    await ctx.deleteMessage();
                } catch (delErr) {
                    console.log('⚠️ Could not delete message:', delErr?.message);
                }
                // Отправляем НОВОЕ сообщение
                await ctx.reply(text, {
                    reply_markup: keyboard,
                    parse_mode: parseMode
                });
            } else {
                // Другие ошибки — логируем и пробрасываем
                console.error('❌ Unexpected edit error:', errMsg);
                throw err;
            }
        }
    }

    static async handleCallbackQuery(ctx) {
        try {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData.startsWith('view_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonMaterialController.showLessonMaterials(ctx, lessonId);
            } else if (callbackData.startsWith('view_material:')) {
                const materialId = parseInt(callbackData.split(':')[1]);
                await LessonMaterialController.showLessonMaterial(ctx, materialId);
            } else if (callbackData.startsWith('back_to_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonMaterialController.backToMaterials(ctx, lessonId);
            }
            await ctx.answerCallbackQuery().catch(() => {});
        } catch (error) {
            console.error('❌ handleCallbackQuery error:', error?.message || error);
            await ctx.answerCallbackQuery('❌ Произошла ошибка').catch(() => {});
        }
    }

    static async showLessonMaterials(ctx, lessonId) {
        try {
            const materials = await lessonService.getLessonMaterialsByLessonId(lessonId);

            if (!materials || materials.length === 0) {
                await ctx.reply('📚 В этом уроке пока нет обучающих материалов.');
                return;
            }

            const sortedMaterials = materials.sort((a, b) => a.order - b.order);
            const keyboard = new InlineKeyboard();

            sortedMaterials.forEach((material) => {
                const safeTitle = material.title.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
                keyboard.text(safeTitle, `view_material:${material.id}`).row();
            });
            keyboard.text('🔙 К уроку', `view_lesson:${lessonId}`).row();

            const message = '📚 Обучающие материалы урока:';

            await this.safeSendText(ctx, message, keyboard, 'Markdown');

        } catch (error) {
            console.error('❌ Error in showLessonMaterials:', error?.message || error);
            await ctx.reply('❌ Ошибка при загрузке списка материалов.');
        }
    }

    static async prepareMarkdownText(title, content) {
        // 1. Очищаем content от HTML-тегов и сущностей
        const rawContent = content
            ? content.replace(/<[^>]*>/g, '')           // удаляем теги
                .replace(/&nbsp;/g, ' ')                 // заменяем &nbsp;
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim()
            : 'Описание отсутствует';

        // 2. Экранируем ТОЛЬКО необходимые символы для legacy Markdown
        const escapeMarkdown = (text) => text.replace(/([_*`[\]])/g, '\\$1');

        const safeTitle = escapeMarkdown(title);
        const safeContent = escapeMarkdown(rawContent);

        // 3. Формируем финальное сообщение
        return `*${safeTitle}*\n\n${safeContent}`;
    }

    static async showLessonMaterial(ctx, materialId) {
        try {
            const material = await lessonService.getByIdWithFiles(materialId);
            if (!material) {
                await ctx.answerCallbackQuery("❌ Материал не найден");
                return;
            }

            // 🔥 Подготовка текста для Markdown (legacy)
            const message = await this.prepareMarkdownText(material.title, material.content);

            const lessonId = material.lessonId;
            const keyboard = KeyboardFactory.createLessonMaterialNavigationKeyboard(lessonId);

            const files = material.files || [];
            const imageFile = files.find(f => f.mime_type?.toLowerCase()?.startsWith('image/'));

            if (imageFile) {
                const filePath = imageFile.path;
                const storagePath = process.env.LARAVEL_STORAGE_PATH
                    || path.join(__dirname, '..', '..');

                const fullPath = path.join(storagePath, filePath);

                try {
                    await fs.access(fullPath);

                    await ctx.editMessageMedia(
                        {
                            type: 'photo',
                            media: new InputFile(fullPath),
                            caption: message,
                            parse_mode: 'Markdown'  // ✅ legacy Markdown
                        },
                        { reply_markup: keyboard }
                    );
                } catch (err) {
                    console.warn('⚠️ File not found, fallback to text:', err.message);
                    await this.safeSendText(ctx, message, keyboard, 'Markdown');
                }
            } else {
                await this.safeSendText(ctx, message, keyboard, 'Markdown');
            }

        } catch (error) {
            console.error('❌ Error in showLessonMaterial:', error?.message || error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке материала').catch(() => {});
        }
    }

    static async backToMaterials(ctx, lessonId) {
        try {
            await LessonMaterialController.showLessonMaterials(ctx, lessonId);
        } catch (error) {
            console.error('❌ Error in backToMaterials:', error?.message || error);
            await ctx.answerCallbackQuery('❌ Ошибка при возврате').catch(() => {});
        }
    }
}

module.exports = LessonMaterialController;
