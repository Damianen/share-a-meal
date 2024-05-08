import { query } from 'express';
import database from '../dtb/mySQLdb.js';
import logger from '../logger.js';
import jwt from 'jsonwebtoken';


const userService = {
    getConnection:() => {
        return new Promise((resolve, reject) => {
            database.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                resolve(connection);
            });
        });
    },

    query: (query, values, connection) => {
        return new Promise((resolve, reject) => {
            connection.query(query, values, (err, rows, fields) => {
                connection.release();
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    },

    sign: (payload, key, expires) => {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, key, expires, (err, token) => {
                if (err) {
                    reject(err);
                }
                resolve(token);
            });
        });
    },

    create: async (user, callback) => {
        logger.info('create user', user);
        try {
            const connection = await this.getConnection();
            const result = await this.query();
            const token = await this.sign();
            logger.trace(`User created with id ${data.id}.`)
            callback(null, {
                status: 200,
                message: `User created with id ${data.id}.`,
                data: data
            });
        } catch (err) {
            logger.info('error creating user: ', err.message || 'unknown error');
            callback(err.message, null);
        }
    },

    update: (userId, user, callback) => {
        logger.info('update user with id: ', userId);
        database.update(userId, user, (err, data) => {
            if (err) {
                logger.info(
                    'error updating user: ',
                    err.message || 'unknown error'
                );
                callback(err, null);
            } else {
                logger.trace(`User updated with id ${data.id}.`);
                callback(null, {
                    status: 200,
                    message: `User updated with id ${data.id}.`,
                    data: data
                });
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