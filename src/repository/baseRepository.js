/**
 * Базовый репозиторий с общими методами для работы с моделями
 */
class BaseRepository {
    constructor(model) {
        this.model = model;
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
            console.error(`Error finding ${this.model.name} by ID:`, error);
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
            console.error(`Error finding all ${this.model.name}:`, error);
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
            console.error(`Error finding ${this.model.name} by condition:`, error);
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
            console.error(`Error finding one ${this.model.name}:`, error);
            throw error;
        }
    }

    /**
     * Создать новую запись
     * @param {Object} data - Данные для создания
     * @returns {Promise<Object>}
     */
    async create(data) {
        try {
            return await this.model.create(data);
        } catch (error) {
            console.error(`Error creating ${this.model.name}:`, error);
            throw error;
        }
    }

    /**
     * Обновить запись
     * @param {number} id - ID записи
     * @param {Object} data - Данные для обновления
     * @returns {Promise<Object|null>}
     */
    async update(id, data) {
        try {
            const record = await this.findById(id);
            if (!record) {
                return null;
            }
            await record.update(data);
            return record;
        } catch (error) {
            console.error(`Error updating ${this.model.name}:`, error);
            throw error;
        }
    }

    /**
     * Удалить запись
     * @param {number} id - ID записи
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        try {
            const record = await this.findById(id);
            if (!record) {
                return false;
            }
            await record.destroy();
            return true;
        } catch (error) {
            console.error(`Error deleting ${this.model.name}:`, error);
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
            console.error(`Error counting ${this.model.name}:`, error);
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
            console.error(`Error checking existence of ${this.model.name}:`, error);
            throw error;
        }
    }
}

module.exports = BaseRepository;

