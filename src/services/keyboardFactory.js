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
     * Создает клавиатуру для курсов с пагинацией
     * @param {Array} courses - Массив курсов
     * @param {number} currentPage - Текущая страница (начиная с 1)
     * @param {number} itemsPerPage - Количество курсов на странице
     * @returns {InlineKeyboard}
     */
    static createCoursesKeyboard(courses = [], currentPage = 1, itemsPerPage = 5) {
        const keyboard = new InlineKeyboard();
        const totalPages = Math.ceil(courses.length / itemsPerPage);
        
        // Курсы текущей страницы
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentCourses = courses.slice(startIndex, endIndex);

        // Добавляем курсы текущей страницы
        currentCourses.forEach(course => {
            keyboard.text(course.title, `view_course:${course.id}`).row();
        });

        // Добавляем кнопки навигации
        if (totalPages > 1) {
            const navRow = [];
            
            // Кнопка "Назад" для страниц
            if (currentPage > 1) {
                navRow.push(keyboard.text('⬅️', `courses_page:${currentPage - 1}`));
            } else {
                // На первой странице - кнопка "Назад к профилю"
                navRow.push(keyboard.text('🔙 К профилю', 'back_to_profile'));
            }
            
            // Индикатор страницы
            navRow.push(keyboard.text(`${currentPage}/${totalPages}`, 'page_info'));
            
            // Кнопка "Вперед"
            if (currentPage < totalPages) {
                navRow.push(keyboard.text('➡️', `courses_page:${currentPage + 1}`));
            }
            
            keyboard.row(...navRow);
        } else if (courses.length > 0) {
            // Если только одна страница, добавляем кнопку "Назад к профилю"
            keyboard.text('🔙 К профилю', 'back_to_profile');
        }

        return keyboard;
    }

    /**
     * Создает клавиатуру для модулей курса
     * @param {Array} modules - Массив модулей
     * @param {number} courseId - ID курса
     * @returns {InlineKeyboard}
     */
    static createModulesKeyboard(modules = [], courseId) {
        const keyboard = new InlineKeyboard();

        modules.forEach(module => {
            keyboard.text(module.title, `view_module:${module.id}`).row();
        });

        // Добавляем кнопку "Назад к курсам"
        keyboard.text('🔙 К курсам', 'back_to_courses');

        return keyboard;
    }

    /**
     * Создает клавиатуру для уроков модуля
     * @param {Array} lessons - Массив уроков
     * @param {number} moduleId - ID модуля
     * @returns {InlineKeyboard}
     */
    static createLessonsKeyboard(lessons = [], moduleId) {
        const keyboard = new InlineKeyboard();

        lessons.forEach(lesson => {
            keyboard.text(lesson.title, `view_lesson:${lesson.id}`).row();
        });

        // Добавляем кнопку "Назад к модулям"
        keyboard.text('🔙 К модулям', `back_to_modules:${moduleId}`);

        return keyboard;
    }

    /**
     * Создает клавиатуру для навигации
     * @param {string} backAction - Действие для кнопки "Назад"
     * @returns {InlineKeyboard}
     */
    static createNavigationKeyboard(backAction = 'back_to_main') {
        return new InlineKeyboard()
            .text('🔙 Назад', backAction);
    }

    /**
     * Создает клавиатуру для урока с кнопкой "Назад к урокам"
     * @param {number} moduleId - ID модуля
     * @param {number} lessonId
     * @returns {InlineKeyboard}
     */
    static createLessonNavigationKeyboard(moduleId, lessonId) {
        return new InlineKeyboard()
            .text('🔙 К урокам', `back_to_lessons:${moduleId}`)
            .text('Обучающие материалы', `view_learning_materials:${lessonId}`)
            .text('Задания', `view_lesson_assignment:${lessonId}`);
    }
}

module.exports = KeyboardFactory;