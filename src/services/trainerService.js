const TrainerRepository = require("../repository/trainerRepository");
const Logger = require("../logger/logger");
class TrainerService {
    constructor() {
        this.trainerRepo = new TrainerRepository()
    }

    async getAllTrainers(){
        try {
            return await this.trainerRepo.getAll();
        } catch (e) {
            Logger.error(e);
        }
    }
}

module.exports = TrainerService;