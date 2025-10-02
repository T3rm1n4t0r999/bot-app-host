const { AccessControl } = require('accesscontrol');

class AccessControlService {
    constructor() {
        this.ac = new AccessControl();
        this.initializeRoles();
    }

    // Инициализация ролей и разрешений
    initializeRoles() {
        this.ac
            // Роль по умолчанию - базовый доступ к боту
            .grant('guest')
            .readOwn('profile', ['*']) // Может видеть свой профиль

            // Студент - доступ к определенным курсам
            .grant('student')
            .extend('guest')
            .readAny('course', ['*']) // Видит все курсы, но доступ через конкретные права

            // Премиум студент - доступ ко всем курсам
            .grant('premium')
            .extend('student') // Наследует все права student
            .readAny('course', ['*']);

        console.log('AccessControl roles initialized');
    }

    // Проверка доступа к курсу
    hasAccessToCourse(userRole, courseId) {
        try {
            // Для premium - полный доступ
            if (userRole === 'premium') {
                return true;
            }

            // Для partner - проверяем конкретные курсы
            if (userRole === 'partner') {
                // Здесь можно добавить логику для конкретных курсов партнера
                const partnerCourses = this.getPartnerCourses();
                return partnerCourses.includes(parseInt(courseId));
            }

            // Для student - базовый доступ (можем ограничить определенные курсы)
            return this.hasStudentAccess(courseId);

        } catch (error) {
            console.error('Error checking course access:', error);
            return false;
        }
    }

    // Получить все доступные курсы для роли
    getAccessibleCourses(userRole, allCourses) {
        try {
            if (userRole === 'premium') {
                return allCourses; // Полный доступ
            }

            if (userRole === 'student') {
                const partnerCourses = this.getPartnerCourses();
                return allCourses.filter(course =>
                    partnerCourses.includes(course.id)
                );
            }

        } catch (error) {
            console.error('Error getting accessible courses:', error);
            return [];
        }
    }

    // Получить разрешения для роли
    getPermissions(role) {
        return this.ac.can(role);
    }
}

// Создаем singleton instance
module.exports = new AccessControlService();