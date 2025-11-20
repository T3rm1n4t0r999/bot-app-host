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

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentCourses = courses.slice(startIndex, endIndex);

        currentCourses.forEach(course => {
            keyboard.text(course.title, `view_course:${course.id}:1`).row();
        });

        // Добавляем кнопки навигации
        if (totalPages > 1) {
            const navRow = [];

            if (currentPage > 1) {
                navRow.push(keyboard.text('⬅️', `courses_page:${currentPage - 1}`));
            } else {
                navRow.push(keyboard.text('🔙 К профилю', 'back_to_profile'));
            }

            navRow.push(keyboard.text(`${currentPage}/${totalPages}`, 'page_info_courses'));

            if (currentPage < totalPages) {
                navRow.push(keyboard.text('➡️', `courses_page:${currentPage + 1}`));
            }
            
            keyboard.row(...navRow);
        } else if (courses.length > 0) {
            keyboard.text('🔙 К профилю', 'show_student_profile');
        }

        return keyboard;
    }

    static createLessonMaterialNavigationKeyboard(lessonId) {
        const keyboard = new InlineKeyboard();
        keyboard.text('К материалам', `back_to_materials:${lessonId}`).row();
        return keyboard;
    }

    /**
     * Создает клавиатуру для модулей курса
     * @param {Array} modules - Массив модулей
     * @param {number} courseId - ID курса
     * @param currentPage - текущая страница
     * @param itemsPerPage
     * @returns {InlineKeyboard} - клавиатура
     */
    static createModulesKeyboard(modules = [], courseId, currentPage=1, itemsPerPage = 5) {
        const keyboard = new InlineKeyboard();
        const totalPages = Math.ceil(modules.length / itemsPerPage);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentModules = modules.slice(startIndex, endIndex);

        currentModules.forEach(module => {
            keyboard.text(module.title, `view_module:${module.id}:1`).row();
        });

        if (totalPages > 1) {
            const navRow = [];

            if (currentPage > 1) {
                navRow.push(
                    InlineKeyboard.text('◀️ Назад', `view_course:${courseId}:${currentPage - 1}`)
                );
            }

            navRow.push(
                InlineKeyboard.text(`${currentPage}/${totalPages}`, `page_info_modules`)
            );

            if (currentPage < totalPages) {
                navRow.push(
                    InlineKeyboard.text('Вперед ▶️', `view_course:${courseId}:${currentPage + 1}`)
                );
            }
            keyboard.add(...navRow);
        }

        keyboard.row()
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
            .text('Обучающие материалы', `view_materials:${lessonId}`)
            .text('Задания', `view_lesson_task:${lessonId}`);
    }

    static createQuestionNavigation(taskQuestion, taskId, currentIndex, totalQuestions, answered, lessonId) {
        const keyboard = new InlineKeyboard();
        const options = typeof taskQuestion.options === 'string'
            ? JSON.parse(taskQuestion.options)
            : taskQuestion.options;

        switch (taskQuestion.questionType) {
            case "multiple_choice":
                options.forEach(option => {
                    const isSelected = Array.isArray(taskQuestion.userAnswer) && taskQuestion.userAnswer.includes(option.key);
                    const icon = isSelected ? "✅" : "◻️";
                    keyboard.text(`${icon} ${option.key}`, `toggle_multi:${taskQuestion.id}:${option.key}:${taskId}`);
                });
                break;

            case "single_choice":
                options.forEach(option => {
                    const isSelected = taskQuestion.userAnswer === option.key;
                    const icon = isSelected ? "🔘" : "⚪";
                    keyboard.text(`${icon} ${option.key}`, `select_single:${taskQuestion.id}:${option.key}:${taskId}`);
                });
                break;
            case "text":
                keyboard.text('✍️ Ввести ответ текстом', `await_text:${taskQuestion.id}:${taskId}`);
                break;
        }

        keyboard.row();
        if (currentIndex > 0) {
            keyboard.text('« Предыдущий', `nav_question:${taskId}:${currentIndex - 1}`);
        }

        if (currentIndex < totalQuestions - 1) {
            keyboard.text('Следующий »', `nav_question:${taskId}:${currentIndex + 1}`);
        } else {
            keyboard.text('✅ Завершить задание', `finish_task:${taskId}`);
        }

        keyboard.row();
        keyboard.text(`📊${answered}/${totalQuestions}`);
        keyboard.text('🔁 Начать заново', `restart_task:${taskId}`);
        keyboard.text('📋 К заданию', `view_lesson_task:${lessonId}`)

        return keyboard;
    }

    /**
     * Клавиатура для задания
     */
    static createTaskKeyboard(lessonId, taskId){
        return new InlineKeyboard()
            .text('🔙 К уроку', `view_lesson:${lessonId}`)
            .text('Начать выполнение', `start_task:${taskId}`)
            .row();
    }

    /**
     * Клавиатура для результатов
     */
    static createResultsKeyboard(taskId, lessonId) {
        return new InlineKeyboard()
            .text('🔄 Пройти заново', `restart_task:${taskId}`)
            .text('📋 К заданию', `view_lesson_task:${lessonId}`)
            .row();
    }

    /**
     * Клавиатура для прогресса
     */
    static createProgressKeyboard(taskId, currentIndex) {
        return new InlineKeyboard()
            .text('↩️ Назад к вопросу', `nav_question:${taskId}:${currentIndex}`)
            .row();
    }
}

module.exports = KeyboardFactory;