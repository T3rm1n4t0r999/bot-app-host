const CourseRepository = require("../repository/courseRepository");

class CourseService {
    constructor() {
        this.courseRepository = new CourseRepository();
    }

    /**
     * Получить все курсы
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async getAllCourses(options = {}) {
        try {
            return await this.courseRepository.findAll(options);
        } catch (error) {
            console.error('Error getting all courses:', error);
            throw error;
        }
    }

    /**
     * Получить доступные курсы для пользователя
     * @param {Object} userData - Данные пользователя
     * @returns {Promise<Array>}
     */
    async getAccessibleCourses(userData) {
        try {
            if (userData.role === 'premium') {
                return await this.getAllCourses();
            }

            if (userData.role === 'student') {
                return await this.courseRepository.getAccessibleCourses(userData);
            }

            return [];
        } catch (error) {
            console.error('Error getting accessible courses:', error);
            throw error;
        }
    }

    /**
     * Получить курс по ID
     * @param {number} courseId - ID курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Object|null>}
     */
    async getCourseById(courseId, options = {}) {
        try {
            return await this.courseRepository.findById(courseId, options);
        } catch (error) {
            console.error('Error getting course by ID:', error);
            throw error;
        }
    }

    /**
     * Получить курс с модулями
     * @param {number} courseId - ID курса
     * @returns {Promise<Object|null>}
     */
    async getCourseWithModules(courseId) {
        try {
            return await this.courseRepository.findByIdWithModules(courseId);
        } catch (error) {
            console.error('Error getting course with modules:', error);
            throw error;
        }
    }

    /**
     * Получить курс со студентами
     * @param {number} courseId - ID курса
     * @returns {Promise<Object|null>}
     */
    async getCourseWithStudents(courseId) {
        try {
            return await this.courseRepository.findByIdWithStudents(courseId);
        } catch (error) {
            console.error('Error getting course with students:', error);
            throw error;
        }
    }

    /**
     * Поиск курсов по названию
     * @param {string} title - Название курса
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async searchCoursesByTitle(title, options = {}) {
        try {
            return await this.courseRepository.findByTitle(title, options);
        } catch (error) {
            console.error('Error searching courses by title:', error);
            throw error;
        }
    }

    /**
     * Получить курсы с пагинацией
     * @param {number} page - Номер страницы
     * @param {number} limit - Количество записей на странице
     * @param {Object} where - Условия поиска
     * @returns {Promise<Object>}
     */
    async getPaginatedCourses(page = 1, limit = 10, where = {}) {
        try {
            return await this.courseRepository.findPaginated(page, limit, where);
        } catch (error) {
            console.error('Error getting paginated courses:', error);
            throw error;
        }
    }

    /**
     * Создать новый курс
     * @param {Object} courseData - Данные курса
     * @returns {Promise<Object>}
     */
    async createCourse(courseData) {
        try {
            return await this.courseRepository.create(courseData);
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    }

    /**
     * Обновить курс
     * @param {number} courseId - ID курса
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise<Object|null>}
     */
    async updateCourse(courseId, updateData) {
        try {
            return await this.courseRepository.update(courseId, updateData);
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    }

    /**
     * Удалить курс
     * @param {number} courseId - ID курса
     * @returns {Promise<boolean>}
     */
    async deleteCourse(courseId) {
        try {
            return await this.courseRepository.delete(courseId);
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }

    /**
     * Получить количество студентов на курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async getStudentCount(courseId) {
        try {
            return await this.courseRepository.getStudentCount(courseId);
        } catch (error) {
            console.error('Error getting student count:', error);
            throw error;
        }
    }

    /**
     * Получить количество модулей в курсе
     * @param {number} courseId - ID курса
     * @returns {Promise<number>}
     */
    async getModuleCount(courseId) {
        try {
            return await this.courseRepository.getModuleCount(courseId);
        } catch (error) {
            console.error('Error getting module count:', error);
            throw error;
        }
    }
}

module.exports = CourseService;