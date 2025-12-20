const { Composer } = require('grammy');
const requireRegistration = require('../middleware/requireRegistration');
const requireStudentRole = require('../middleware/requireStudentRole');
const requireHandledAnswer = require('../middleware/requireHandledAnswer');

const StudentController = require('../controllers/studentController');
const CourseController = require("../controllers/courseController");
const LessonController = require("../controllers/lessonController");
const ModuleController = require("../controllers/moduleController");
const LessonMaterialController = require("../controllers/lessonMaterialController");
const LessonTaskController = require("../controllers/lessonTaskController");
const HomeworkController = require("../controllers/homeworkController");
const QuestionController = require("../controllers/questionController");
const router = new Composer();

// Обработка callback queries для курсов
router.callbackQuery('back_to_courses', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_main', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('back_to_profile', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery(/courses_page:\d+/, requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);

// Обработка callback queries для модулей
router.callbackQuery(/view_course:\d+:\d+/, requireRegistration(), requireStudentRole(), ModuleController.handleCallbackQuery);
router.callbackQuery(/back_to_modules:\d+/, requireRegistration(), requireStudentRole(), ModuleController.handleCallbackQuery);

// Обработка callback queries для уроков
router.callbackQuery(/view_module:\d+/, requireRegistration(), requireStudentRole(), LessonController.handleCallbackQuery);
router.callbackQuery(/view_lesson:\d+/, requireRegistration(), requireStudentRole(), LessonController.handleCallbackQuery);
router.callbackQuery(/back_to_lessons:\d+/, requireRegistration(), requireStudentRole(), LessonController.handleCallbackQuery);

// Обработка callback queries для материалов урока
router.callbackQuery(/view_materials:\d+/, requireRegistration(), requireStudentRole(), LessonMaterialController.handleCallbackQuery);
router.callbackQuery(/view_material:\d+/, requireRegistration(), requireStudentRole(), LessonMaterialController.handleCallbackQuery);
router.callbackQuery(/back_to_materials:\d+/, requireRegistration(), requireStudentRole(), LessonMaterialController.handleCallbackQuery);

// Обработка callback queries для заданий урока
router.callbackQuery(/back_to_lesson:\d+/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/back_to_task:\d+/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);
router.callbackQuery(/view_lesson_task:\d+/, requireRegistration(), requireStudentRole(), LessonTaskController.handleCallbackQuery);


// Обработка callback queries для кнопок внутри вопросов
router.callbackQuery(/start_task:\d+/, requireRegistration(), requireStudentRole(), QuestionController.handleCallbackQuery);
router.callbackQuery(/question_toggle_multi:/, requireRegistration(), requireStudentRole(), QuestionController.handleCallbackQuery);
router.callbackQuery(/question_select_single:/, requireRegistration(), requireStudentRole(),QuestionController.handleCallbackQuery);
router.callbackQuery(/question_await_text:/, requireRegistration(), requireStudentRole(), QuestionController.handleCallbackQuery);
router.callbackQuery(/question_nav:/, requireRegistration(), requireStudentRole(), QuestionController.handleCallbackQuery);
router.callbackQuery(/question_finish:/, requireRegistration(), requireStudentRole(), QuestionController.handleCallbackQuery);
router.callbackQuery(/question_show_progress:/, requireRegistration(), requireStudentRole(),QuestionController.handleCallbackQuery);
router.callbackQuery(/question_restart:/, requireRegistration(), requireStudentRole(), QuestionController.handleCallbackQuery);
router.callbackQuery(/question_back_to_task/, requireRegistration(), requireStudentRole(), QuestionController.handleCallbackQuery);

// Обработка callback queries для домашних заданий
router.callbackQuery(/view_homework:\d+/, requireRegistration(), requireStudentRole(), HomeworkController.handleCallbackQuery);
router.callbackQuery(/back_to_homework:\d+/, requireRegistration(), requireStudentRole(), HomeworkController.handleCallbackQuery);

// Служебная кнопка-индикатор страницы
router.callbackQuery('page_info_course', requireRegistration(), requireStudentRole(), CourseController.handleCallbackQuery);
router.callbackQuery('page_info_module', requireRegistration(), requireStudentRole(), ModuleController.handleCallbackQuery);

// Команды бота

// Обработка команды /start
router.command('start', StudentController.handleStart);

// Обработка команд показа профиля
router.command('profile', requireRegistration(), requireHandledAnswer(), StudentController.showStudentInfo);
router.hears('👤 Мой профиль', requireRegistration(), requireHandledAnswer(), StudentController.showStudentInfo);
router.callbackQuery('show_student_profile', requireRegistration(), requireHandledAnswer(), StudentController.showStudentInfo);
router.callbackQuery('show_leaderboard', requireRegistration(), requireHandledAnswer(), StudentController.showLeaderboard);
// Обработка команд показа курса
router.command('course', requireRegistration(), requireStudentRole(), requireHandledAnswer(), (ctx) => CourseController.showCourses(ctx, 1));
router.hears('📚 Курсы', requireRegistration(), requireStudentRole(), requireHandledAnswer(), (ctx) => CourseController.showCourses(ctx, 1));

// // Обработка команд показа домашних заданий
router.command('homework',requireRegistration(), requireStudentRole(),  requireHandledAnswer(), (ctx) => HomeworkController.showHomeworks(ctx, 1));
router.hears('📝 Домашние задания', requireRegistration(), requireStudentRole(),  requireHandledAnswer(), (ctx) => HomeworkController.showHomeworks(ctx, 1));
router.callbackQuery('back_to_homework', requireRegistration(), requireStudentRole(), HomeworkController.handleCallbackQuery);

// Обработка текстового ответа пользователя для вопросов (если ожидается текст)
router.on('message:text', requireRegistration(), requireStudentRole(), async (ctx, next) => {
    const handled = await QuestionController.handleTextAnswer(ctx);
    if (!handled) await next();
});

module.exports = router; 