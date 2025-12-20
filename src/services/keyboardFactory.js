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
     * Создает клавиатуру профиля
     * @returns {Keyboard}
     */
    static createProfileKeyboard() {
        return new InlineKeyboard().text('Таблица лидеров', 'show_leaderboard');
    }

    static createLeaderboardKeyboard(leaderboard, currentStudent) {
        const keyboard = new InlineKeyboard();
        leaderboard.forEach(student => {
            let leaderText;
            if(student.id === currentStudent.id) {
                leaderText = `${student.username} - ${student.score} | Это вы!`
            }
            else leaderText = `${student.username} - ${student.score}`
            keyboard.text(leaderText, `leaderboard:${student.id}`).row();
        })
        keyboard.text('Вернуться в профиль', `show_student_profile`).row();
        return keyboard;
    }

    static createHomeworkTaskKeyboard(homeworkId, entityType = 'homework') {
        return new InlineKeyboard()
            .text('🔙 К заданию', 'back_to_homework')
            .text('Начать выполнение', `start_task:${homeworkId}:${entityType}`)
            .row();
    }

    /**
     * Клавиатура для задания
     */
    static createLessonTaskKeyboard(taskId, lessonId, entityType = 'lesson_task'){
        return new InlineKeyboard()
            .text('🔙 К уроку', `back_to_lesson:${lessonId}`)
            .text('Начать выполнение', `start_task:${taskId}:${entityType}`)
            .row();
    }

    /**
     * Создает клавиатуру для домашних заданий с пагинацией
     * @param {Array} homeworks - Массив курсов
     * @param {number} currentPage - Текущая страница (начиная с 1)
     * @param {number} itemsPerPage - Количество курсов на странице
     * @returns {InlineKeyboard}
     */
    static createHomeworksKeyboard(homeworks = [], currentPage = 1, itemsPerPage = 4) {
        const keyboard = new InlineKeyboard();
        const totalPages = Math.ceil(homeworks.length / itemsPerPage);

        currentPage = Math.max(1, Math.min(currentPage, totalPages));
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentHomeworks = homeworks.slice(startIndex, endIndex);

        currentHomeworks.forEach(homework => {
            keyboard.text(homework.title, `view_homework:${homework.id}:1`).row();
        })
        // Добавляем кнопки навигации
        if (totalPages > 1) {
            const navRow = [];

            if (currentPage > 1) {
                navRow.push(InlineKeyboard.text('⬅️', `homework_page:${currentPage - 1}`));
            } else {
                navRow.push(InlineKeyboard.text('🔙 К профилю', 'show_student_profile'));
            }

            navRow.push(InlineKeyboard.text(`${currentPage}/${totalPages}`, 'page_info_homework'));

            if (currentPage < totalPages) {
                navRow.push(InlineKeyboard.text('➡️', `homework_page:${currentPage + 1}`));
            }

            keyboard.row(...navRow);
        } else if (homeworks.length > 0) {
            keyboard.text('🔙 К профилю', `show_student_profile`);
        }

        return keyboard;
    }

    /**
     * Создает клавиатуру для курсов с пагинацией
     * @param {Array} courses - Массив курсов
     * @param {number} currentPage - Текущая страница (начиная с 1)
     * @param {number} itemsPerPage - Количество курсов на странице
     * @returns {InlineKeyboard}
     */
    static createCoursesKeyboard(courses = [], currentPage = 1, itemsPerPage = 4) {
        const keyboard = new InlineKeyboard();
        const totalPages = Math.ceil(courses.length / itemsPerPage);

        currentPage = Math.max(1, Math.min(currentPage, totalPages));
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
                navRow.push(InlineKeyboard.text('⬅️', `courses_page:${currentPage - 1}`));
            } else {
                navRow.push(InlineKeyboard.text('🔙 К профилю', 'show_student_profile'));
            }

            navRow.push(InlineKeyboard.text(`${currentPage}/${totalPages}`, 'page_info_courses'));

            if (currentPage < totalPages) {
                navRow.push(InlineKeyboard.text('➡️', `courses_page:${currentPage + 1}`));
            }

            keyboard.row(...navRow);
        } else if (courses.length > 0) {
            keyboard.text('🔙 К профилю', `show_student_profile`);
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
    static createModulesKeyboard(modules = [], courseId, currentPage=1, itemsPerPage = 4) {
        const keyboard = new InlineKeyboard();
        const totalPages = Math.ceil(modules.length / itemsPerPage);
        currentPage = Math.max(1, Math.min(currentPage, totalPages));

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

    static createQuestionNavigation(question, entityId, currentIndex, totalQuestions, answered, entityType) {
        const keyboard = new InlineKeyboard();
        const options = typeof question.options === 'string'
            ? JSON.parse(question.options)
            : question.options;

        // Обработка различных типов вопросов
        switch (question.questionType) {
            case "multiple_choice":
                options.forEach(option => {
                    const isSelected = Array.isArray(question.userAnswer) && question.userAnswer.includes(option.key);
                    const icon = isSelected ? "✅" : "◻️";
                    keyboard.text(`${icon} ${option.key}`, `question_toggle_multi:${entityType}:${question.id}:${option.key}:${entityId}`);
                });
                break;

            case "single_choice":
                options.forEach(option => {
                    const isSelected = question.userAnswer === option.key;
                    const icon = isSelected ? "🔘" : "⚪";
                    keyboard.text(`${icon} ${option.key}`, `question_select_single:${entityType}:${question.id}:${option.key}:${entityId}`);
                });
                break;

            case "text":
                const buttonText = question.questionType === 'code' ? '💻 Ввести код' : '✍️ Ввести ответ текстом';
                const buttonIcon = question.userAnswer ? '📝' : '✍️';
                keyboard.text(`${buttonText}`, `question_await_text:${entityType}:${question.id}:${entityId}`);
                break;
        }

        // Навигация между вопросами
        keyboard.row();
        if (currentIndex > 0) {
            keyboard.text('« Предыдущий', `question_nav:${entityType}:${entityId}:${currentIndex - 1}`);
        }

        if (currentIndex < totalQuestions - 1) {
            keyboard.text('Следующий »', `question_nav:${entityType}:${entityId}:${currentIndex + 1}`);
        } else {
            keyboard.text('✅ Завершить', `question_finish:${entityType}:${entityId}`);
        }

        // Дополнительные действия
        keyboard.row();
        keyboard.text(`📊 ${answered}/${totalQuestions}`, `question_show_progress:${entityType}:${entityId}`);
        keyboard.text('🔁 Заново', `question_restart:${entityType}:${entityId}`);
        keyboard.text('📋 К заданию', `question_back_to_task:${entityType}:${entityId}`);

        return keyboard;
    }

    /**
     * Клавиатура для результатов
     */
    static createResultsKeyboard(entityId, entityType) {
        const keyboard = new InlineKeyboard();

        // Основные действия
        keyboard.text('🔄 Пройти заново', `question_restart:${entityType}:${entityId}`);

        // Разные действия в зависимости от типа сущности
        switch (entityType) {
            case 'lesson_task':
                keyboard.text('📚 К уроку', `view_lesson_task:${entityId}`);
                break;
            case 'homework':
                keyboard.text('🏠 К домашнему заданию', `view_homework:${entityId}`);
                break;
            case 'training':
                keyboard.text('💪 К тренажеру', `view_training:${entityId}`);
                break;
        }

        keyboard.row();
        keyboard.text('📊 Статистика', `show_statistics:${entityType}:${entityId}`);

        return keyboard;
    }

    /**
     * Клавиатура для прогресса
     */
    static createProgressKeyboard(entityId, currentIndex) {
        return new InlineKeyboard()
            .text('↩️ Назад к вопросу', `question_nav:${entityType}:${entityId}:${currentIndex}`)
            .text('📋 К заданию', `question_back_to_task:${entityType}:${entityId}`)
            .row();
    }
}

module.exports = KeyboardFactory;