const { Composer } = require('grammy');
const requireRegistration = require('../middleware/requireRegistration');
const requireStudentRole = require('../middleware/requireStudentRole');

const StudentController = require('../controllers/studentController');
const CourseController = require("../controllers/courseController");
const LessonController = require("../controllers/lessonController");
const ModuleController = require("../controllers/moduleController");

const router = new Composer();

// Обработка callback queries для курсов, модулей и уроков
router.callbackQuery(/view_course:\d+/, requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery(/view_module:\d+/, requireRegistration(), requireStudentRole(), ModuleController.handleCallbackQuery);
router.callbackQuery(/view_lesson:\d+/, requireRegistration(), requireStudentRole(), LessonController.handleCallbackQuery);
router.callbackQuery(/courses_page:\d+/, requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery(/back_to_modules:\d+/, requireRegistration(), requireStudentRole(), ModuleController.handleCallbackQuery);
router.callbackQuery(/back_to_lessons:\d+/, requireRegistration(), requireStudentRole(), LessonController.handleCallbackQuery);
router.callbackQuery('back_to_courses', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_main', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_profile', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);

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

module.exports = router; 