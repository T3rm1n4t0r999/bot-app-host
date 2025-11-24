const {sequelize,testConnection} = require('../database/db');
const {setupAssociations} = require("../models");

class DatabaseSeeder {
    constructor() {
        this.courses = [];
        this.modules = [];
        this.lessons = [];
        this.lessonMaterials = [];
        this.tasks = [];
        this.questions = [];
        this.student = null
        this.models = {};
    }

    async initializeModels() {
        // Инициализируем модели после установки соединения
        this.models.Student = require('../models/student');
        this.models.Course = require('../models/course');
        this.models.Module = require('../models/module');
        this.models.Lesson = require('../models/lesson');
        this.models.LessonMaterial = require('../models/lessonMaterial');
        this.models.LessonTask = require('../models/lessonTask');
        this.models.TaskQuestion = require('../models/question');
        this.models.File = require('../models/file');
        this.models.StudentProgress = require('../models/studentProgress');
        this.models.StudentCourse = require('../models/studentCourse');
    }

    async seed() {
        try {
            console.log('🚀 Начинаем заполнение базы тестовыми данными...');

            // Используем ту же функцию подключения, что и в боте
            const isConnected = await testConnection();
            if (!isConnected) {
                throw new Error('Database connection failed');
            }

            console.log('✅ Подключение к БД успешно');

            // Настраиваем ассоциации
            setupAssociations();

            // Синхронизируем модели
            await sequelize.sync({ force: false });
            console.log('✅ Модели синхронизированы с базой данных');

            // Инициализируем модели
            await this.initializeModels();

            // Очищаем базу (раскомментируйте если нужно)
            await this.clearDatabase();

            //Создаем тестовые данные
            await this.createStudent();
            await this.createCourses();
            await this.createModules();
            await this.createLessons();
            await this.createLessonMaterials();
            await this.createTasks();
            await this.createTaskQuestions();
            await this.addCoursesToStudent();

            console.log('✅ База данных успешно заполнена тестовыми данными!');
            console.log(`📊 Создано:`);
            console.log(`   - Курсов: ${this.courses.length}`);
            console.log(`   - Модулей: ${this.modules.length}`);
            console.log(`   - Уроков: ${this.lessons.length}`);
            console.log(`   - Материалов: ${this.lessonMaterials.length}`);
            console.log(`   - Заданий: ${this.tasks.length}`);
            console.log(`   - Вопросов: ${this.questions.length}`);

        } catch (error) {
            console.error('❌ Ошибка при заполнении базы данных:', error.message);
            throw error;
        }
    }


    async clearDatabase() {
        console.log('🧹 Очищаем базу данных...');

        // Удаляем данные в правильном порядке (с учетом foreign keys)
        await this.models.Student.destroy({where: {}, force: true});
        await this.models.StudentProgress.destroy({ where: {}, force: true });
        await this.models.TaskQuestion.destroy({ where: {}, force: true });
        await this.models.LessonTask.destroy({ where: {}, force: true });
        await this.models.File.destroy({ where: {}, force: true });
        await this.models.LessonMaterial.destroy({ where: {}, force: true });
        await this.models.Lesson.destroy({ where: {}, force: true });
        await this.models.Module.destroy({ where: {}, force: true });
        await this.models.Course.destroy({ where: {}, force: true });

        console.log('✅ База данных очищена');
    }

    async addCoursesToStudent() {
        console.log('📚 Добавляем все курсы студенту...');

        const studentCoursesData = this.courses.map(course => ({
            studentId: 1,
            courseId: course.id,
            grantedBy: 'system',
            grantedAt: new Date(),
            progress: 0,
            lastAccessed: new Date()
        }));

        await this.models.StudentCourse.bulkCreate(studentCoursesData);

        // Выводим информацию о добавленных курсах
        this.courses.forEach(course => {
            console.log(`   - ${course.title}`);
        });
    }

    async createCourses() {
        console.log('📚 Создаем курсы...');

        const coursesData = [
            {
                title: 'Основы программирования',
                description: 'Идеальный курс для начинающих программистов. Изучите основы алгоритмов и структур данных.'
            },
            {
                title: 'Веб-разработка',
                description: 'Полный курс по созданию современных веб-приложений. Frontend и Backend.'
            },
            {
                title: 'Машинное обучение',
                description: 'Погрузитесь в мир искусственного интеллекта и data science.'
            }
        ];

        this.courses = await this.models.Course.bulkCreate(coursesData);
        console.log(`✅ Создано ${this.courses.length} курсов`);
    }

    async createModules() {
        console.log('📖 Создаем модули...');

        const modulesData = [];

        // Модули для курса "Основы программирования"
        modulesData.push(
            { title: 'Введение в программирование', description: 'Основные концепции и термины', courseId: this.courses[0].id },
            { title: 'Алгоритмы и структуры данных', description: 'Фундаментальные алгоритмы', courseId: this.courses[0].id },
            { title: 'ООП и паттерны проектирования', description: 'Объектно-ориентированное программирование', courseId: this.courses[0].id }
        );

        // Модули для курса "Веб-разработка"
        modulesData.push(
            { title: 'HTML и CSS', description: 'Верстка и стилизация', courseId: this.courses[1].id },
            { title: 'JavaScript и Frontend', description: 'Интерактивность на стороне клиента', courseId: this.courses[1].id },
            { title: 'Node.js и Backend', description: 'Серверная разработка', courseId: this.courses[1].id }
        );

        // Модули для курса "Машинное обучение"
        modulesData.push(
            { title: 'Математические основы', description: 'Линейная алгебра и статистика', courseId: this.courses[2].id },
            { title: 'Базовые алгоритмы ML', description: 'Классификация и регрессия', courseId: this.courses[2].id },
            { title: 'Нейронные сети', description: 'Глубокое обучение', courseId: this.courses[2].id }
        );

        this.modules = await this.models.Module.bulkCreate(modulesData);
        console.log(`✅ Создано ${this.modules.length} модулей`);
    }

    async createLessons() {
        console.log('📝 Создаем уроки...');

        const lessonsData = [];

        // Уроки для модуля "Введение в программирование"
        lessonsData.push(
            {
                title: 'Что такое программирование?',
                description: 'Основные понятия и история развития',
                moduleId: this.modules[0].id
            },
            {
                title: 'Переменные и типы данных',
                description: 'Работа с данными в программах',
                moduleId: this.modules[0].id
            },
            {
                title: 'Условные операторы',
                description: 'Принятие решений в программах',
                moduleId: this.modules[0].id
            }
        );

        // Уроки для модуля "Алгоритмы и структуры данных"
        lessonsData.push(
            {
                title: 'Линейные алгоритмы',
                description: 'Последовательное выполнение операций',
                moduleId: this.modules[1].id
            },
            {
                title: 'Массивы и списки',
                description: 'Работа с коллекциями данных',
                moduleId: this.modules[1].id
            }
        );

        // Уроки для модуля "HTML и CSS"
        lessonsData.push(
            {
                title: 'Структура HTML документа',
                description: 'Основы разметки веб-страниц',
                moduleId: this.modules[3].id
            },
            {
                title: 'CSS селекторы и свойства',
                description: 'Стилизация элементов',
                moduleId: this.modules[3].id
            }
        );

        this.lessons = await this.models.Lesson.bulkCreate(lessonsData);
        console.log(`✅ Создано ${this.lessons.length} уроков`);
    }

    async createLessonMaterials() {
        console.log('📚 Создаем обучающие материалы...');

        const materialsData = [];

        this.lessons.forEach((lesson, index) => {
            // Для каждого урока создаем несколько материалов разного типа

            // Теория
            materialsData.push({
                title: `Теоретический материал к уроку "${lesson.title}"`,
                content: `Это подробное теоретическое объяснение темы урока. Здесь рассматриваются основные концепции, принципы и методики, необходимые для понимания материала.\n\nКлючевые моменты:\n• Основные понятия\n• Теоретические основы\n• Примеры применения\n• Рекомендации по изучению`,
                order: 0,
                materialType: 'theory',
                lessonId: lesson.id
            });

            // Примеры
            materialsData.push({
                title: `Примеры и практические задания`,
                content: `В этом разделе представлены практические примеры применения изученной теории.\n\nПример 1: Базовый случай\nПример 2: Продвинутое использование\nПример 3: Реальная задача`,
                order: 1,
                materialType: 'example',
                lessonId: lesson.id
            });

            // Справочник (каждому третьему уроку)
            if (index % 3 === 0) {
                materialsData.push({
                    title: `Справочные материалы`,
                    content: `Полезные ссылки, документация и дополнительные ресурсы для углубленного изучения темы.`,
                    order: 2,
                    materialType: 'reference',
                    lessonId: lesson.id
                });
            }

            // Видеоурок (каждому второму уроку)
            if (index % 2 === 0) {
                materialsData.push({
                    title: `Видеообъяснение темы`,
                    content: `В этом видеоуроке подробно разбираются все аспекты темы с наглядными примерами.`,
                    order: 3,
                    materialType: 'video_lesson',
                    lessonId: lesson.id
                });
            }
        });

        this.lessonMaterials = await this.models.LessonMaterial.bulkCreate(materialsData);
        console.log(`✅ Создано ${this.lessonMaterials.length} материалов`);
    }

    async createTasks() {
        console.log('📝 Создаем задания...');

        const tasksData = [];

        this.lessons.forEach((lesson, index) => {
            tasksData.push({
                title: `Практическое задание: ${lesson.title}`,
                description: `Примените полученные знания на практике в этом задании.`,
                lessonId: lesson.id
            });
        });

        this.tasks = await this.models.LessonTask.bulkCreate(tasksData);
        console.log(`✅ Создано ${this.tasks.length} заданий`);
    }

    async createTaskQuestions() {
        console.log('❓ Создаем вопросы для заданий...');

        const questionsData = [];

        this.tasks.forEach((task, taskIndex) => {
            // Создаем несколько вопросов для каждого задания

            // Вопрос с выбором ответа
            questionsData.push({
                question: `Что является основным понятием в теме "${task.title}"?`,
                questionType: 'single_choice',
                options: JSON.stringify(['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D']),
                correctAnswers: JSON.stringify([0]), // Индекс правильного ответа
                points: 1,
                order: 0,
                taskId: task.id
            });

            // Текстовый вопрос
            questionsData.push({
                question: `Опишите своими словами основную идею изученного материала.`,
                questionType: 'text',
                points: 2,
                order: 1,
                taskId: task.id
            });

            // Вопрос с множественным выбором (для каждого третьего задания)
            if (taskIndex % 3 === 0) {
                questionsData.push({
                    question: `Какие из перечисленных утверждений верны для этой темы?`,
                    questionType: 'multiple_choice',
                    options: JSON.stringify(['Утверждение 1', 'Утверждение 2', 'Утверждение 3', 'Утверждение 4']),
                    correctAnswers: JSON.stringify([0, 2]), // Индексы правильных ответов
                    points: 3,
                    order: 2,
                    taskId: task.id
                });
            }

            // Вопрос с кодом (для каждого второго задания)
            if (taskIndex % 2 === 0) {
                questionsData.push({
                    question: `Напишите код, решающий следующую задачу: продемонстрируйте основные концепции этой темы.`,
                    questionType: 'code',
                    points: 5,
                    order: 3,
                    taskId: task.id
                });
            }
        });

        this.questions = await this.models.TaskQuestion.bulkCreate(questionsData);
        console.log(`✅ Создано ${this.questions.length} вопросов`);
    }

    async createStudent() {
        const studentData = {
            id: 1,
            telegram_id: "5295612007",
            firstname:"Кузя"
        };
        this.student = await this.models.Student.create(studentData);
    }
}

// Запуск скрипта
async function runSeeder() {
    const seeder = new DatabaseSeeder();
    try {
        await seeder.seed();
        console.log('🎉 Скрипт завершен успешно!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Скрипт завершен с ошибкой:', error);
        process.exit(1);
    }
}


runSeeder();
