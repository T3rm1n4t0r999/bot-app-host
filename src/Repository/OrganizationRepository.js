const BaseRepository = require('./BaseRepository');
const Organization = require('../Models/Organization');

class OrganizationRepository extends BaseRepository {
    constructor() {
        super(Organization);
    }

}

module.exports = OrganizationRepository;