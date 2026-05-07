const InvitationRepository = require("../repository/invitationRepository");
const OrganizationRepository = require("../repository/organizationRepository");
const BotRepository = require("../repository/botRepository");
const StudentRepository = require("../repository/studentRepository");
class InvitationService {
    constructor() {
        this.invitationRepository = new InvitationRepository();
        this.botRepository = new BotRepository();
        this.studentRepository = new StudentRepository();
    }

    async verifyStudentInvitation(token, botUsername) {
        try {
            const invitation =  await this.invitationRepository.findByToken(token);
            if (!invitation) {
                return null;
            }
            const isExpired = !invitation?.expires_at || new Date() >= new Date(invitation.expires_at);
            const isStudent = invitation?.type === 'student'
            const isPending =  invitation?.status === 'pending'
            if (isExpired || !isStudent || !isPending) {
                return null;
            }
            const invitationOrgId = await invitation?.organization_id;
            const bot = await this.botRepository.findByUsername(botUsername);
            const botOrgId = bot?.organization_id;
            if (botOrgId === invitationOrgId) {
                if (invitation?.limited) {
                    await this.invitationRepository.confirmInvitation(invitation?.id);
                }
                return invitation;
            }else{
                return null;
            }
        } catch (error) {
            console.error('Error getting all courses:', error);
            throw error;
        }
    }


}

module.exports = InvitationService;