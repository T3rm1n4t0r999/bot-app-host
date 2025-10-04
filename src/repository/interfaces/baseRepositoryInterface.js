/**
 * Базовый интерфейс для репозиториев
 */
class BaseRepositoryInterface {
    /**
     * Найти запись по ID
     * @param {number} id - ID записи
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Object|null>}
     */
    async findById(id, options = {}) {
        throw new Error('Method findById must be implemented');
    }

    /**
     * Найти все записи
     * @param {Object} options - Опции для запроса
     * @returns {Promise<Array>}
     */
    async findAll(options = {}) {
        throw new Error('Method findAll must be implemented');
    }

    /**
     * Найти записи по условию
     * @param {Object} where - Условия поиска
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByCondition(where, options = {}) {
        throw new Error('Method findByCondition must be implemented');
    }

    /**
     * Найти одну запись по условию
     * @param {Object} where - Условия поиска
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Object|null>}
     */
    async findOne(where, options = {}) {
        throw new Error('Method findOne must be implemented');
    }

    /**
     * Создать новую запись
     * @param {Object} data - Данные для создания
     * @returns {Promise<Object>}
     */
    async create(data) {
        throw new Error('Method create must be implemented');
    }

    /**
     * Обновить запись
     * @param {number} id - ID записи
     * @param {Object} data - Данные для обновления
     * @returns {Promise<Object|null>}
     */
    async update(id, data) {
        throw new Error('Method update must be implemented');
    }

    /**
     * Удалить запись
     * @param {number} id - ID записи
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        throw new Error('Method delete must be implemented');
    }

    /**
     * Подсчитать количество записей
     * @param {Object} where - Условия поиска
     * @returns {Promise<number>}
     */
    async count(where = {}) {
        throw new Error('Method count must be implemented');
    }

    /**
     * Проверить существование записи
     * @param {Object} where - Условия поиска
     * @returns {Promise<boolean>}
     */
    async exists(where) {
        throw new Error('Method exists must be implemented');
    }
}

module.exports = BaseRepositoryInterface;
