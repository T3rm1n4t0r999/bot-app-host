// repositories/LessonMaterialRepository.js
const BaseRepository = require('./BaseRepository');
const LessonMaterial = require('../models/LessonMaterial');
const File = require('../models/File');

class LessonMaterialRepository extends BaseRepository {
    constructor() {
        super(LessonMaterial);
    }

    /**
     * Получить все обучающие материалы по ID урока
     * @param {number} lessonId - ID урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByLessonId(lessonId) {
        try {
            return await this.findByCondition(
                { lessonId, is_active: true },
                {
                    order: [['order', 'ASC']],
                }
            );

        } catch (error) {
            console.error('Error finding lesson materials by lesson ID:', error);
            throw error;
        }
    }

    /**
     * Получить обучающие материалы с файлами
     * @param {number} materialId - ID материала
     * @returns {Promise<Array>}
     */
    async findByIdWithFiles(materialId) {
        try {
            return await this.findById(materialId, {
                include: [{
                    model: File,
                    as: 'files',
                    required: false
                }]
            });
        } catch (error) {
            console.error('Error finding material with files:', error);
            throw error;
        }
    }
}

module.exports = LessonMaterialRepository;