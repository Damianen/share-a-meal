import database from '../dtb/mySQLdb.js';
import logger from '../logger.js';
import jwt from 'jsonwebtoken';

const getConnection = () => {
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }
            resolve(connection);
        });
    });
}

const query = (query, connection) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows, fields) => {
            connection.release();
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

const sign = (payload, key, expires) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, key, expires, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}

const userService = {
    create: async (user, callback) => {
        logger.info('create user', user);
        try {
            const connection = await getConnection();
            const result = await query(
                `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES ('${user.firstName}', '${user.lastName}', '${user.isActive}', '${user.emailAdress}', '${user.password}', '${user.phoneNumber || ''}', '${user.roles || ''}', '${user.street || ''}', '${user.city || ''}');`,
                connection
            );
            logger.trace(`User created with id ${result.insertId}.`)
            callback(null, {
                status: 200,
                message: `User created with id ${result.insertId}.`,
                data: user
            });
        } catch (err) {
            logger.info('error creating user: ', err.message || 'unknown error');
            callback(err.message, null);
        }
    },

    update: async (userId, user, callback) => {
        logger.info('update user with id: ', userId);
        const queryString = `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', isActive = '${user.isActive}', emailAdress = '${user.emailAdress}', password = '${user.password}', phoneNumber = '${user.phoneNumber || ''}', roles = '${user.roles || ''}', street = '${user.street || ''}', city = '${user.city || ''}' WHERE id = ${userId};`;
        logger.info(queryString);
        try {
            const connection = await getConnection();
            const result = await query(queryString, connection);
            logger.trace(`User updated with id ${userId}.`);
                callback(null, {
                    status: 200,
                    message: `User updated with id ${userId}.`,
                    data: user
                });
        } catch (err) {
            logger.info('error updating user: ', err.message || 'unknown error');
            callback(err.message, null);
        }
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
                    message: `Found user with id ${userId} .`,
                    data: data
                });
            }
        });
    }
}

export default userService;