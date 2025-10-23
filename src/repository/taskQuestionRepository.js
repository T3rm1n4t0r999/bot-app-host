const BaseRepository = require('./baseRepository');
const TaskQuestion = require('../models/taskQuestion');

class taskQuestionRepository extends BaseRepository {
    constructor() {
        super(TaskQuestion);
    }

    async findByLessonTaskId(taskId, options = {}) {
        try {
            return await this.findByCondition(
                { taskId },
                {
                    order: [['id', 'ASC']],
                }
            );
        } catch (error) {
            console.error('Error finding questions by task ID:', error);
            throw error;
        }

    }

}

module.exports = taskQuestionRepository;