const { Composer } = require('grammy');
const requireRegistration = require('../middleware/requireRegistration');
const requireStudentRole = require('../middleware/requireStudentRole');

const StudentController = require('../controllers/studentController');
const HomeworkController = require('../controllers/homeworkController');
const CourseController = require("../controllers/courseController");

const router = new Composer();

// Обработка callback queries
router.callbackQuery(/courses_page:\d+/, requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery(/view_course:\d+/, requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_main', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);

router.command('start', StudentController.handleStart);
router.command('profile', requireRegistration(), StudentController.getStudentInfo);
router.hears('👤 Мой профиль', requireRegistration(), StudentController.getStudentInfo);

router.command('course', requireRegistration(), requireStudentRole(), CourseController.getCourses);
router.hears('📚 Курсы', requireRegistration(), requireStudentRole(), CourseController.getCourses);

// router.command('homework',requireRegistration(), requireStudentRole(), HomeworkController.getHomework)
// router.hears('📝 Домашние задания', requireRegistration(), requireStudentRole(), HomeworkController.getHomework);

module.exports = router;