import BaseRepository from "./baseRepository";
import TaskQuestion from "../models/taskQuestion";

class taskQuestionRepository extends BaseRepository {
    constructor() {
        super(TaskQuestion);
    }

    async findByLessonTaskId(lessonTaskId, options = {}) {
        try {
            return await this.findByCondition(
                { lessonTaskId },
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