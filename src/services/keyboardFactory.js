// services/KeyboardFactory.js
const { InlineKeyboard, Keyboard } = require('grammy');

class KeyboardFactory {
    /**
     * Создает главную клавиатуру меню
     * @returns {Keyboard}
     */
    static createMainMenuKeyboard() {
        return new Keyboard()
            .text('👤 Мой профиль').row()
            .text('📝 Домашние задания')
            .text('📚 Курсы').row()
            .resized();
    }

    /**
     * Создает клавиатуру для курсов
     * @returns {Keyboard}
     */
    static createCoursesKeyboard(courses = [], currentPage = 1, itemsPerPage = 1) {
        const keyboard = new InlineKeyboard();
        const totalPages = Math.ceil(courses.length / itemsPerPage);

        // Курсы текущей страницы
        const startIndex = (currentPage - 1) * itemsPerPage;
        const currentCourses = courses.slice(startIndex, startIndex + itemsPerPage);
    }
}

module.exports = KeyboardFactory;