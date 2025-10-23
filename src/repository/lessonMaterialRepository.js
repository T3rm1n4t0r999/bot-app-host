// repositories/lessonMaterialRepository.js
const BaseRepository = require('./baseRepository');
const LessonMaterial = require('../models/lessonMaterial');
const File = require('../models/file');

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
                { lessonId },
                {
                    order: [['order', 'ASC'], ['id', 'ASC']]
                }
            );

        } catch (error) {
            console.error('Error finding lesson materials by lesson ID:', error);
            throw error;
        }
    }

    /**
     * Получить обучающие материалы с файлами
     * @param {number} lessonId - ID урока
     * @returns {Promise<Array>}
     */
    async findByLessonIdWithFiles(lessonId) {
        try {
            return await this.findByCondition(
                { lessonId },
                {
                    include: [{
                        model: File,
                        as: 'files',
                        order: [['order', 'ASC']]
                    }],
                    order: [['order', 'ASC'], ['id', 'ASC']]
                }
            );
        } catch (error) {
            console.error('Error finding lesson materials with files:', error);
            throw error;
        }
    }

    /**
     * Получить обучающие материалы по типу
     * @param {number} lessonId - ID урока
     * @param {string} materialType - Тип материала
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByLessonIdAndType(lessonId, materialType, options = {}) {
        try {
            return await this.findByCondition(
                {
                    lessonId,
                    materialType
                },
                {
                    order: [['order', 'ASC'], ['id', 'ASC']],
                    ...options
                }
            );
        } catch (error) {
            console.error('Error finding lesson materials by type:', error);
            throw error;
        }
    }

    /**
     * Получить количество обучающих материалов в уроке
     * @param {number} lessonId - ID урока
     * @returns {Promise<number>}
     */
    async countByLessonId(lessonId) {
        try {
            return await this.count({ lessonId });
        } catch (error) {
            console.error('Error counting lesson materials by lesson ID:', error);
            throw error;
        }
    }

    /**
     * Получить обучающие материалы с пагинацией
     * @param {number} lessonId - ID урока
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>}
     */
    async findPaginatedByLessonId(lessonId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await this.model.findAndCountAll({
                where: { lessonId },
                include: [{
                    model: File,
                    as: 'files',
                    order: [['order', 'ASC']]
                }],
                order: [['order', 'ASC'], ['id', 'ASC']],
                limit,
                offset
            });

            return {
                lessonMaterials: rows,
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(count / limit),
                hasPrevPage: page > 1
            };
        } catch (error) {
            console.error('Error finding paginated lesson materials:', error);
            throw error;
        }
    }

    /**
     * Обновить порядок материалов
     * @param {number} materialId - ID материала
     * @param {number} newOrder - Новый порядок
     * @returns {Promise<Object>}
     */
    async updateOrder(materialId, newOrder) {
        try {
            return await this.update(materialId, { order: newOrder });
        } catch (error) {
            console.error('Error updating lesson material order:', error);
            throw error;
        }
    }

    /**
     * Получить следующий порядковый номер для нового материала
     * @param {number} lessonId - ID урока
     * @returns {Promise<number>}
     */
    async getNextOrder(lessonId) {
        try {
            const lastMaterial = await this.model.findOne({
                where: { lessonId },
                order: [['order', 'DESC']],
                attributes: ['order']
            });

            return lastMaterial ? lastMaterial.order + 1 : 0;
        } catch (error) {
            console.error('Error getting next order for lesson material:', error);
            throw error;
        }
    }
}

module.exports = LessonMaterialRepository;