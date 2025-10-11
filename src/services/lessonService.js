const LessonRepository = require('../repository/lessonRepository');
const LearningMaterialsRepository = require('../repository/lessonMaterialRepository');
const LessonAssignmentRepository = require("../repository/lessonTaskRepository");

class LessonService {
    constructor() {
        this.lessonRepository = new LessonRepository();
        this.learningMaterialsRepository = new LearningMaterialsRepository();
        this.assignmentRepository = new LessonAssignmentRepository();
    }

    /**
     * Получить все уроки для конкретного модуля
     * @param {number} moduleId - ID модуля
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив уроков
     */
    async getLessonsByModuleId(moduleId, options = {}) {
        try {
            return await this.lessonRepository.findByModuleId(moduleId, options);
        } catch (error) {
            console.error('Error getting lessons by module ID:', error);
            throw error;
        }
    }
    async getMaterialById(materialId, options = {}) {
        try {
            return await this.learningMaterialsRepository.findById(materialId, options);
        } catch (e) {
            console.error('Error getting material by material ID');
        }
    }
    /**
     * Получить урок по ID
     * @param {number} lessonId - ID урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Object|null>} - Урок или null
     */
    async getLessonById(lessonId, options = {}) {
        try {
            return await this.lessonRepository.findById(lessonId, options);
        } catch (error) {
            console.error('Error getting lesson by ID:', error);
            throw error;
        }
    }

    /**
     * Получить урок с информацией о модуле
     * @param {number} lessonId - ID урока
     * @returns {Promise<Object|null>} - Урок с модулем или null
     */
    async getLessonWithModule(lessonId) {
        try {
            return await this.lessonRepository.findByIdWithModule(lessonId);
        } catch (error) {
            console.error('Error getting lesson with module:', error);
            throw error;
        }
    }

    /**
     * Получить все уроки с информацией о модулях и курсах
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив уроков с модулями и курсами
     */
    async getAllLessonsWithModulesAndCourses(options = {}) {
        try {
            return await this.lessonRepository.findAllWithModulesAndCourses(options);
        } catch (error) {
            console.error('Error getting all lessons with modules and courses:', error);
            throw error;
        }
    }

    /**
     * Поиск уроков по названию
     * @param {string} title - Название урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив уроков
     */
    async searchLessonsByTitle(title, options = {}) {
        try {
            return await this.lessonRepository.findByTitle(title, options);
        } catch (error) {
            console.error('Error searching lessons by title:', error);
            throw error;
        }
    }

    /**
     * Поиск уроков по содержимому
     * @param {string} content - Содержимое урока
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив уроков
     */
    async searchLessonsByContent(content, options = {}) {
        try {
            return await this.lessonRepository.findByContent(content, options);
        } catch (error) {
            console.error('Error searching lessons by content:', error);
            throw error;
        }
    }

    /**
     * Получить количество уроков в модуле
     * @param {number} moduleId - ID модуля
     * @returns {Promise<number>} - Количество уроков
     */
    async getLessonCountByModuleId(moduleId) {
        try {
            return await this.lessonRepository.countByModuleId(moduleId);
        } catch (error) {
            console.error('Error getting lesson count by module ID:', error);
            throw error;
        }
    }

    /**
     * Получить уроки с пагинацией
     * @param {number} moduleId - ID модуля
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @returns {Promise<Object>} - Объект с уроками и метаданными пагинации
     */
    async getPaginatedLessons(moduleId, page = 1, limit = 10) {
        try {
            return await this.lessonRepository.findPaginatedByModuleId(moduleId, page, limit);
        } catch (error) {
            console.error('Error getting paginated lessons:', error);
            throw error;
        }
    }

    /**
     * Получить уроки по курсу (через модули)
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>} - Массив уроков
     */
    async getLessonsByCourseId(courseId, options = {}) {
        try {
            return await this.lessonRepository.findByCourseId(courseId, options);
        } catch (error) {
            console.error('Error getting lessons by course ID:', error);
            throw error;
        }
    }

    /**
     * Создать новый урок
     * @param {Object} lessonData - Данные урока
     * @returns {Promise<Object>} - Созданный урок
     */
    async createLesson(lessonData) {
        try {
            return await this.lessonRepository.create(lessonData);
        } catch (error) {
            console.error('Error creating lesson:', error);
            throw error;
        }
    }

    /**
     * Обновить урок
     * @param {number} lessonId - ID урока
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise<Object|null>} - Обновленный урок или null
     */
    async updateLesson(lessonId, updateData) {
        try {
            return await this.lessonRepository.update(lessonId, updateData);
        } catch (error) {
            console.error('Error updating lesson:', error);
            throw error;
        }
    }

    /**
     * Удалить урок
     * @param {number} lessonId - ID урока
     * @returns {Promise<boolean>} - Результат удаления
     */
    async deleteLesson(lessonId) {
        try {
            return await this.lessonRepository.delete(lessonId);
        } catch (error) {
            console.error('Error deleting lesson:', error);
            throw error;
        }
    }

    /**
     * Проверить существование урока
     * @param {number} lessonId - ID урока
     * @returns {Promise<boolean>} - Существует ли урок
     */
    async lessonExists(lessonId) {
        try {
            return await this.lessonRepository.exists({ id: lessonId });
        } catch (error) {
            console.error('Error checking lesson existence:', error);
            throw error;
        }
    }

    /**
     * Получить все обучающие материалы по ID урока
     * @param {number} lessonId - ID урока
     * @returns {Promise<Array>}
     */
    async getLearningMaterialsByLessonId(lessonId) {
        try {
            return await this.learningMaterialsRepository.findByLessonId(lessonId);
        } catch (error) {
            console.error('Error getting learning materials by lesson ID:', error);
            throw new Error(`Failed to get learning materials: ${error.message}`);
        }
    }

    async showLessonAssignment(lessonId){
        try {
            return await this.assignmentRepository.findByLessonId(lessonId);
        } catch (e) {
            console.error('Error getting assignment by lesson ID:', error);
            throw new Error(`Failed to get assignment: ${error.message}`);
        }
    }


}

module.exports = LessonService;
