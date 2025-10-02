const Course = require('../models/course');
const StudentCourse = require('../models/studentCourse');

class CourseRepository{

    static async getAllCourses(){
        return await Course.findAll();
    }

    static async getAccessibleCourses(userData){
        const courses = await StudentCourse.findAll({
            where: { studentId: userData.id },
            include: [{
                model: Course,
                as: 'course',
                required: true
            }],
        });
        return courses.map(studentCourse => studentCourse.course);
    }
}

module.exports = CourseRepository;