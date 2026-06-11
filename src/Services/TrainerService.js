const TrainerRepository = require("../Repository/TrainerRepository");
const Logger = require("../Logger/Logger");
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