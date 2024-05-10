import query from '../dtb/mySQLdb.js';
import logger from '../logger.js';

const mealService = {
    create: async (meal, userId, callback) => {
        logger.warn('create meal', meal);
        try {
            const result = await query(
                'INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageURL, cookId, createDate, updateDate, name, description, allergenes)' +
                `VALUES (${meal.isActive}, ${meal.isVega}, ${meal.isVegan}, ${meal.isToTakeHome}, '${meal.dateTime}', ${meal.maxAmountOfParticipants}, ${meal.price}, '${meal.imageURL}', ${userId}, '${meal.createDate}', '${Date.now().toString()}', '${meal.name}', '${meal.description}', '${meal.allergenes}')`,
            );
            logger.trace(`meal created with id ${result.insertId}.`)
            callback(null, {
                status: 200,
                message: `meal created with id ${result.insertId}.`,
                data: meal
            });
        } catch (err) {
            logger.info('error creating meal: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    delete: async (mealId, userId, callback) => {
        logger.info('deleting meal with id: ', mealId);
        try {
            const result = await query(
                `SELECT * FROM meal WHERE id = ${mealId};`, 
            );
            if (!result || result.length < 1) {
                throw { status: 404, message: `Meal with id: ${mealId} not found!`, data: {}};
            }
            logger.warn(result[0]);
            if (result[0].cookId != userId){
                throw { status: 403, message: "Not authorized to delete this meal!", data: {}};
            }
            await query(
                `DELETE FROM meal WHERE id = ${mealId};`, 
            );
            logger.trace(`Meal deleted with id ${mealId}.`);
            callback(null, {
                status: 200,
                message: `Meal deleted with id ${mealId}.`,
            });
        } catch (err) {
            logger.info('error deleting meal: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getAll: async (callback) => {
        try {
            const meals = await query(
                `SELECT * FROM meal;`, 
            );
            for (let i = 0; i < meals.length; i++) {
                const userCook = await query(
                    `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE id = ${meals[i].cookId};`, 
                );
                meals[i].cook = userCook[0];
                meals[i].participants = [];
                const participantIds = await query(
                    `SELECT userId FROM meal_participants_user WHERE mealId = ${meals[i].id}`
                );
                for (let j = 0; j < participantIds.length; j++) {
                    const participant = await query(
                        `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE id = ${participantIds[j].userId};`, 
                    );
                    meals[i].participants.push(participant[0]);
                }
            }
            
            callback(null, {
                status: 200,
                message: `Found ${meals.length} meals.`,
                data: meals
            });
        } catch (err) {
            callback(err, null);
        }
    },

    getById: async (mealId, callback) => {
        try {
            const meals = await query(
                `SELECT * FROM meal WHERE id = ${mealId};`, 
            );
            if (!meals || meals.length < 1) {
                throw { status: 404, message: `Meal with id: ${mealId} not found!`, data: {}};
            }
            const userCook = await query(
                `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE id = ${meals[0].cookId};`, 
            );
            meals[0].cook = userCook[0];
            meals[0].participants = [];
            const participantIds = await query(
                `SELECT userId FROM meal_participants_user WHERE mealId = ${meals[0].id}`
            );
            for (let j = 0; j < participantIds.length; j++) {
                const participant = await query(
                    `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE id = ${participantIds[j].userId};`, 
                );
                meals[0].participants.push(participant[0]);
            }
            callback(null, {
                status: 200,
                message: `Found meal with id: ${mealId}.`,
                data: meals[0]
            });
        } catch (err) {
            callback(err, null);
        }
    }
}

export default mealService;