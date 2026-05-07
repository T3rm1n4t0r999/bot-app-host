const BaseRepository = require('./baseRepository');
const Invitation = require('../models/invitation');

class InvitationRepository extends BaseRepository {
    constructor() {
        super(Invitation);
    }

    /**
     * Получить все курсы
     * @param {Object} options - Дополнительные опции
     * @returns {Promise<Array>}
     */
    async findByToken(token, options = {}) {
        try {
            return await super.findOne({
                where: { token },
                ...options
            });
        } catch (error) {
            console.error('Error finding invitation by token:', error);
            throw error;
        }
    }

    async confirmInvitation(token, options = {}) {
        const transaction = options.transaction || await this.model.sequelize.transaction();

        try {
            // Находим приглашение с блокировкой строки
            const invitation = await super.findOne({
                where: { token },
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!invitation) {
                await transaction.rollback();
                return null;
            }

            // Проверки
            if (invitation.status !== 'pending') {
                await transaction.rollback();
                throw new Error('Invitation already processed');
            }

            if (invitation.expires_at && new Date() > new Date(invitation.expires_at)) {
                await transaction.rollback();
                throw new Error('Invitation expired');
            }

            // Обновляем запись
            const updateData = {
                accepted_at: new Date()
            };

            // Если limited, уменьшаем оставшиеся использования
            if (invitation.limited === true) {
                updateData.status = 'accepted';
            }

            await invitation.update(updateData, { transaction });

            await transaction.commit();

            return invitation;
        } catch (error) {
            await transaction.rollback();
            console.error('Error confirming invitation:', error);
            throw error;
        }
    }

}

module.exports = InvitationRepository;