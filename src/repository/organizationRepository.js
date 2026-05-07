const BaseRepository = require('./baseRepository');
const Organization = require('../models/organization');

class OrganizationRepository extends BaseRepository {
    constructor() {
        super(Organization);
    }

}

module.exports = OrganizationRepository;