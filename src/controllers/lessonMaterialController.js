const {InlineKeyboard} = require("grammy");
const LessonService = require("../services/lessonService");

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
            } else if(callbackData.startsWith('back_to_materials:')) {
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
            const material = await lessonService.getMaterialByIdWithFiles(materialId);
            if (!material) {
                await ctx.answerCallbackQuery("Материал не найден");
                return
            }
            let message = `Название урока: ${material.title}\nОписание урока: ${material.content}`;

            const lessonId = material.lessonId;
            const keyboard = KeyboardFactory.createLessonMaterialNavigationKeyboard(lessonId)

            const files = material.files;
            // Если есть файлы, отправляем их
            if (files && files.length > 0) {
                await LessonMaterialController.sendFilesWithMessage(ctx, files, message, keyboard);
            } else {
                // Если файлов нет, отправляем только текст
                await ctx.editMessageText(message, {
                    reply_markup: keyboard,
                    parse_mode: 'Markdown'
                });
            }
            await ctx.answerCallbackQuery();
        } catch (e) {
        }
    }

    static async sendFilesWithMessage(ctx, files, message, keyboard) {
        try {
            const sortedFiles = files.sort((a, b) => a.order - b.order);

            // Разделяем файлы по типам для медиагруппы
            const mediaGroup = [];

            sortedFiles.forEach((file, index) => {
                if (index === 0 && (file.fileType === 'photo' || file.fileType === 'video')) {
                    // Первый файл (фото/видео) с сообщением
                    const mediaItem = {
                        type: file.fileType,
                        media: file.fileId,
                        caption: index === 0 ? message : file.caption,
                        parse_mode: 'Markdown'
                    };
                    mediaGroup.push(mediaItem);
                } else if (file.fileType === 'photo' || file.fileType === 'video') {
                    // Остальные фото/видео
                    const mediaItem = {
                        type: file.fileType,
                        media: file.fileId,
                        caption: file.caption,
                        parse_mode: 'Markdown'
                    };
                    mediaGroup.push(mediaItem);
                } else {
                    // Другие типы файлов
                    otherFiles.push(file);
                }
            });

            // Отправляем медиагруппу если есть фото/видео
            if (mediaGroup.length > 0) {
                if (mediaGroup.length === 1) {
                    // Если только один файл, отправляем отдельно с клавиатурой
                    const file = sortedFiles[0];
                    const options = {
                        caption: message,
                        parse_mode: 'Markdown',
                        reply_markup: keyboard
                    };

                    if (file.fileType === 'photo') {
                        await ctx.replyWithPhoto(file.fileId, options);
                    } else {
                        await ctx.replyWithVideo(file.fileId, options);
                    }
                } else {
                    // Если несколько файлов, отправляем медиагруппу
                    await ctx.replyWithMediaGroup(mediaGroup);

                    // Отправляем клавиатуру отдельным сообщением
                    if (keyboard) {
                        await ctx.reply('📎 Файлы урока:', {
                            reply_markup: keyboard
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error sending media group:', error);
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

}

module.exports = LessonMaterialController;