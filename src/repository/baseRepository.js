const logger = require('../logger/logger');
/**
 * Базовый репозиторий с общими методами для работы с моделями
 */
class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    /**
     * Увеличить значение поля
     * @param {string} field - Поле для увеличения
     * @param {Object} options - Опции { by: number, where: Object, transaction: Object }
     * @returns {Promise<Array>}
     */
    async increment(field, options = {}) {
        try {
            const { by = 1, where = {}} = options;

            return await this.model.increment(field, {
                by,
                where,
            });
        } catch (error) {
            logger.error(`Error incrementing ${field} in ${this.model.name}:`, error);
            throw error;
        }
    }


    /**
     * Найти запись по ID
     * @param {number} id - ID записи
     * @param {Object} options - Дополнительные опции для запроса
     * @returns {Promise<Object|null>}
     */
    async findById(id, options = {}) {
        try {
            return await this.model.findByPk(id, options);
        } catch (error) {
            logger.error(`Error finding ${this.model.name} by ID:`);
            throw error;
        }
    }

    /**
     * Найти все записи
     * @param {Object} options - Опции для запроса
     * @returns {Promise<Array>}
     */
    async findAll(options = {}) {
        try {
            return await this.model.findAll(options);
        } catch (error) {
            logger.error(`Error finding all ${this.model.name}:`);
            throw error;
        }
    }

    /**
     * Найти записи по условию
     * @param {Object} where - Условия поиска
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCondition(where, options = {}) {
        try {
            return await this.model.findAll({
                where,
                ...options
            });
        } catch (error) {
            logger.error(`Error finding ${this.model.name} by condition:`);
            throw error;
        }
    }

    /**
     * Найти одну запись по условию
     * @param {Object} where - Условия поиска
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Object|null>}
     */
    async findOne(where, options = {}) {
        try {
            return await this.model.findOne({
                where,
                ...options
            });
        } catch (error) {
            logger.error(`Error finding one ${this.model.name}:`);
            throw error;
        }
    }

    /**
     * Создать новую запись
     * @param {Object} data - Данные для создания
     * @param options
     * @returns {Promise<Object>}
     */
    async create(data, options = {}) {
        try {
            return await this.model.create(data, options);
        } catch (error) {
            logger.error(`Error creating ${this.model.name}:`);
            throw error;
        }
    }

    /**
     * Обновить запись
     * @param {number} id - ID записи
     * @param {Object} data - Данные для обновления
     * @param options
     * @returns {Promise<Object|null>}
     */
    async update(id, data, options = {}) {
        try {
            const record = await this.findById(id);
            if (!record) {
                return null;
            }
            await record.update(data, options);
            return record;
        } catch (error) {
            logger.error(`Error updating ${this.model.name}:`);
            throw error;
        }
    }

    /**
     * Подсчитать количество записей
     * @param {Object} where - Условия поиска
     * @returns {Promise<number>}
     */
    async count(where = {}) {
        try {
            return await this.model.count({ where });
        } catch (error) {
            logger.error(`Error counting ${this.model.name}:`);
            throw error;
        }
    }

    /**
     * Проверить существование записи
     * @param {Object} where - Условия поиска
     * @returns {Promise<boolean>}
     */
    async exists(where) {
        try {
            const count = await this.count(where);
            return count > 0;
        } catch (error) {
            logger.error(`Error checking existence of ${this.model.name}:`);
            throw error;
        }
    }
}

module.exports = BaseRepository;

