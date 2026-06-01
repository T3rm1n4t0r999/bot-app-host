const { InlineKeyboard } = require("grammy");
const LessonService = require("../services/lessonService");
const KeyboardFactory = require("../services/keyboardFactory");
const lessonService = new LessonService();

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
            } else if (callbackData.startsWith('back_to_materials:')) {
                const lessonId = parseInt(callbackData.split(':')[1]);
                await LessonMaterialController.backToMaterials(ctx, lessonId);
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
                await ctx.answerCallbackQuery('В этом уроке пока нет обучающих материалов.');
                return;
            }

            let message = `Обучающие материалы урока:`;
            materials.forEach((material) => {
                keyboard.text(material.title, `view_material:${material.id}`).row();
            });
            keyboard.text('🔙 К уроку', `view_lesson:${lessonId}`).row();

            await LessonMaterialController.updateMessage(ctx, message, keyboard, null, 'Markdown');
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Error showing lesson materials:', error);
            await ctx.reply('❌ Произошла ошибка при загрузке материалов урока.');
        }
    }

    static async showLessonMaterial(ctx, materialId) {
        try {
            const material = await lessonService.getByIdWithFiles(materialId);
            if (!material) {
                await ctx.answerCallbackQuery("Материал не найден");
                return;
            }

            // Основной текст
            let message = `*${material.title}*\n\n${material.content || 'Описание отсутствует'}`;

            // Клавиатура
            const lessonId = material.lessonId;
            const keyboard = KeyboardFactory.createLessonMaterialNavigationKeyboard(lessonId);

            // Получаем файлы (полиморфные)
            let files = [];
            if (Array.isArray(material.files)) files = material.files;
            else if (material.file) files = [material.file];
            else if (material.File) files = [material.File];

            // Ищем изображение
            const imageFile = files.find(f => {
                if (f.mime_type && f.mime_type.startsWith('image/')) return true;
                const ext = f.extension ? f.extension.toLowerCase() : '';
                return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
            });

            // Ищем видеофайл
            const videoFile = files.find(f => {
                if (f.mime_type && f.mime_type.startsWith('video/')) return true;
                const ext = f.extension ? f.extension.toLowerCase() : '';
                return ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext);
            });

            // Готовим URL для файлов (заглушка для теста, реальный URL строится по хранилищу)
            const buildStorageUrl = (file) => {
                // Используйте реальный BASE_STORAGE_URL
                const BASE_STORAGE_URL = process.env.FILE_STORAGE_URL || 'https://edubot.fun';
                const encodedPath = file.path.split('/').map(encodeURIComponent).join('/');
                return `${BASE_STORAGE_URL}/storage/${encodedPath}`;
            };

            let mediaType = null;
            let mediaUrl = null;

            if (imageFile) {
                mediaType = 'photo';
                mediaUrl = buildStorageUrl(imageFile);
            } else if (videoFile) {
                mediaType = 'video';
                mediaUrl = buildStorageUrl(videoFile);

            } else if (material.video_url) {
                message += `\n\n📹 [Смотреть видео](${material.video_url})`;
            }

            await LessonMaterialController.updateMessage(ctx, message, keyboard, { type: mediaType, url: mediaUrl }, 'Markdown');
            await ctx.answerCallbackQuery();
        } catch (error) {
            console.error('Error showing lesson material:', error);
            await ctx.answerCallbackQuery('❌ Ошибка при загрузке материала');
        }
    }

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

    /**
     * УНИВЕРСАЛЬНЫЙ МЕТОД ОБНОВЛЕНИЯ СООБЩЕНИЯ
     * Поддерживает текст, фото и видео.
     * @param {Context} ctx - контекст grammy
     * @param {string} text - текст / подпись
     * @param {InlineKeyboard} keyboard - клавиатура
     * @param {Object|null} media - { type: 'photo'|'video', url: string } или строка (для обратной совместимости)
     * @param {string} parseMode - режим парсинга
     */
    static async updateMessage(ctx, text, keyboard, media = null, parseMode = 'Markdown') {
        // Нормализуем параметр media
        let mediaType = null;
        let mediaUrl = null;

        if (typeof media === 'object' && media !== null) {
            mediaType = media.type;
            mediaUrl = media.url;
        } else if (typeof media === 'string' && media.length > 0) {
            // старый формат: строка = картинка
            mediaType = 'photo';
            mediaUrl = media;
        }

        const currentMsg = ctx.callbackQuery?.message;
        const isCurrentMedia = !!(currentMsg?.photo || currentMsg?.video || currentMsg?.document || currentMsg?.animation);
        const isNextMedia = !!mediaUrl;

        // Если тип сообщения меняется (текст ↔ медиа) или меняется тип медиа (фото ↔ видео)
        if ((isCurrentMedia !== isNextMedia) ||
            (isCurrentMedia && isNextMedia &&
                ((currentMsg.photo && mediaType !== 'photo') || (currentMsg.video && mediaType !== 'video')))) {
            try {
                await ctx.deleteMessage();
            } catch (e) {
                console.warn('Не удалось удалить сообщение:', e.description || e.message);
            }

            if (isNextMedia) {
                if (mediaType === 'photo') {
                    await ctx.replyWithPhoto(mediaUrl, {
                        caption: text,
                        parse_mode: parseMode,
                        reply_markup: keyboard
                    });
                } else if (mediaType === 'video') {
                    await ctx.replyWithVideo(mediaUrl, {
                        caption: text,
                        parse_mode: parseMode,
                        reply_markup: keyboard
                    });
                }
            } else {
                await ctx.reply(text, {
                    parse_mode: parseMode,
                    reply_markup: keyboard
                });
            }
        } else {
            // Тип не изменился – редактируем существующее
            if (isNextMedia) {
                if (mediaType === 'photo') {
                    await ctx.editMessageMedia({
                        type: 'photo',
                        media: mediaUrl,
                        caption: text,
                        parse_mode: parseMode
                    }, { reply_markup: keyboard });
                } else if (mediaType === 'video') {
                    await ctx.editMessageMedia({
                        type: 'video',
                        media: mediaUrl,
                        caption: text,
                        parse_mode: parseMode
                    }, { reply_markup: keyboard });
                }
            } else {
                await ctx.editMessageText(text, {
                    parse_mode: parseMode,
                    reply_markup: keyboard
                });
            }
        }
    }
}

module.exports = LessonMaterialController;