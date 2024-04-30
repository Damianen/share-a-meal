import database from '../dtb/inmem-db.js';
import logger from '../logger.js';

const userService = {
    create: (user, callback) => {
        logger.info('create user', user);
        database.add(user, (err, data) => {
            if (err) {
                logger.info(
                    'error creating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User created with id ${data.id}.`)
                callback(null, {
                    message: `User created with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    update: (userId, user, callback) => {
        logger.info('update user with id: ', userId);
        database.update(userId, user, (err, data) => {
            if (err) {
                logger.info(
                    'error updating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User updated with id ${data.id}.`)
                callback(null, {
                    message: `User updated with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    delete: (userId, callback) => {
        logger.info('deleting user with id: ', userId);
        database.delete(userId, (err, data) => {
            if (err) {
                logger.info(
                    'error deleting user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User deleted with id ${data}.`)
                callback(null, {
                    message: `User deleted with id ${data}.`,
                });
            }
        })
    },

    getAll: (callback) => {
        logger.info('getAll');
        database.getAll((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `Found ${data.length} users.`,
                    data: data
                });
            }
        });
    },

    getById: (userId, callback) => {
        logger.info('get info from user with id: ' + userId);
        database.getById(userId, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `Found user with id ${userId} .`,
                    data: data
                });
            }
        });
    }
}

export default userService;