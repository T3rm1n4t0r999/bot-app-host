const TrainerRepository = require("../repository/TrainerRepository");
const Logger = require("../logger/Logger");
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