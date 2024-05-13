import query from '../dtb/mySQLdb.js';
import logger from '../logger.js';

const registrationService = {    
    create: async (mealId, userId, callback) => {
        logger.trace(`RegistrationService: create registration to meal with id: ${mealId}`);
        try {
            const meal = await query(
                `SELECT * FROM meal WHERE id = ${mealId};`
            );
            if (!meal || meal.length < 1) {
                throw { status: 404, message: 'meal not found', data: {}};
            }
            const participants = await query(
                `SELECT * FROM meal_participants_user WHERE mealId = ${mealId}`
            )
            if (participants.length + 1 > meal[0].maxAmountOfParticipants) {
                throw { status: 200, message: 'meal is full', data: {}};
            }
            const result = await query(
                `INSERT INTO meal_participants_user (mealId, userId) VALUES (${mealId}, ${userId});`
            );
            callback(null, {
                status: 200,
                message: `Registration created to meal with id: ${mealId}.`,
                data: {
                    userId: userId,
                    mealId: mealId
                }
            });
        } catch (err) {
            logger.info('error creating registration: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    delete: async (mealId, userId, callback) => {
        logger.trace(`RegistrationService: delete registration from meal with id: ${mealId}`);
        try {
            const meal = await query(
                `SELECT * FROM meal WHERE id = ${mealId};`
            );
            if (!meal || meal.length < 1) {
                throw { status: 404, message: 'meal not found', data: {}};
            }
            const registration = await query(
                `SELECT * FROM meal_participants_user WHERE mealId = ${mealId} AND userId = ${userId};`
            )
            if (!registration || registration.length < 1) {
                throw { status: 404, message: 'registration does not exist', data: {}};
            }
            await query(
                `DELETE FROM meal_participants_user WHERE mealId = ${mealId} AND userId = ${userId};`
            );
            callback(null, {
                status: 200,
                message: `Registration deleted to meal with id: ${mealId}.`
            });
        } catch (err) {
            logger.info('error deleting registration: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getAllParticipants: async (mealId, callback) => {
        logger.trace(`RegistrationService: get all participants for meal with id: ${mealId}`);
        try {
            const result = await query(
                `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE id in (SELECT userId FROM meal_participants_user WHERE mealId = ${mealId});`, 
            );
            callback(null, {
                status: 200,
                message: `Got all participants from meal with id: ${mealId}`,
                data: result
            });
        } catch (err) {
            logger.info('error getting participants: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getParticipantById: async (mealId, userId, callback) => {
        logger.trace(`RegistrationService: get participant with id: ${userId} for meal with id: ${mealId}`);
        try {
            const result = await query(
                `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE id in (SELECT userId FROM meal_participants_user WHERE mealId = ${mealId} AND userId = ${userId});`, 
            );
            callback(null, {
                status: 200,
                message: `Got participant with id: ${userId} for meal with id: ${mealId}`,
                data: result[0]
            });
        } catch (err) {
            logger.info('error getting participant: ', err.message || 'unknown error');
            callback(err, null);
        }
    }
}

export default registrationService;