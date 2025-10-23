const { Composer } = require('grammy');
const requireRegistration = require('../middleware/requireRegistration');
const requireStudentRole = require('../middleware/requireStudentRole');

const StudentController = require('../controllers/studentController');
const CourseController = require("../controllers/courseController");
const LessonController = require("../controllers/lessonController");
const ModuleController = require("../controllers/moduleController");
const LessonMaterialController = require("../controllers/lessonMaterialController");
const LessonTaskController = require("../controllers/lessonTaskController");

const router = new Composer();

// Обработка callback queries для курсов
router.callbackQuery(/view_course:\d+/, requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_courses', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_main', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_profile', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery(/courses_page:\d+/, requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);

// Обработка callback queries для модулей
router.callbackQuery(/view_module:\d+/, requireRegistration(), requireStudentRole(), ModuleController.handleCallbackQuery);
router.callbackQuery(/back_to_modules:\d+/, requireRegistration(), requireStudentRole(), ModuleController.handleCallbackQuery);

// Обработка callback queries для уроков
router.callbackQuery(/view_lesson:\d+/, requireRegistration(), requireStudentRole(), LessonController.handleCallbackQuery);
router.callbackQuery(/back_to_lessons:\d+/, requireRegistration(), requireStudentRole(), LessonController.handleCallbackQuery);

// Обработка callback queries для материалов урока
router.callbackQuery(/view_lesson_materials:\d+/, requireRegistration(), requireStudentRole(), LessonMaterialController.handleCallbackQuery);
router.callbackQuery(/view_lesson_material:\d+/, requireRegistration(), requireStudentRole(), LessonMaterialController.handleCallbackQuery);
router.callbackQuery(/back_to_lesson_materials:\d+/, requireRegistration(), requireStudentRole(), LessonMaterialController.handleCallbackQuery);

// Обработка callback queries для заданий урока
router.callbackQuery(/view_lesson_task:\d+/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/view_task_questions:\d+/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/view_task_question:\d+/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);

// бработка callback queries для кнопок внутри заданий/вопросов
router.callbackQuery(/toggle_multi:/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/select_single:/, requireRegistration(), requireStudentRole(),LessonTaskController.handleCallbackQuery);
router.callbackQuery(/await_text:/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/nav_question:/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/finish_task:/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/show_progress:/, requireRegistration(), requireStudentRole(),LessonTaskController.handleCallbackQuery);
router.callbackQuery(/restart_task:/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/back_to_tasks/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);

// Служебная кнопка-индикатор страницы
router.callbackQuery('page_info', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);


// Команды бота
router.command('start', StudentController.handleStart);
router.command('profile', requireRegistration(), StudentController.getStudentInfo);
router.hears('👤 Мой профиль', requireRegistration(), StudentController.getStudentInfo);

router.command('course', requireRegistration(), requireStudentRole(), CourseController.getCourses);
router.hears('📚 Курсы', requireRegistration(), requireStudentRole(), CourseController.getCourses);

// Команда для отладки модулей (можно удалить в продакшене)
router.command('modules', requireRegistration(), requireStudentRole(), ModuleController.getModules);

// router.command('homework',requireRegistration(), requireStudentRole(), HomeworkController.getHomework)
// router.hears('📝 Домашние задания', requireRegistration(), requireStudentRole(), HomeworkController.getHomework);

// Обработка текстового ответа пользователя для вопросов (если ожидается текст)
router.on('message:text', requireRegistration(), requireStudentRole(), async (ctx, next) => {
    const handled = await LessonController.handleTextAnswer(ctx);
    if (!handled) return next();
});

module.exports = router; 