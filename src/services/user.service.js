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
                `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES ('${user.firstName}', '${user.lastName}', '${user.isActive}', '${user.emailAdress}', '${user.password}', '${user.phoneNumber}', '${user.roles}', '${user.street || ''}', '${user.city || ''}');`,
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
            callback(err, null);
        }
    },

    update: async (userId, user, callback) => {
        logger.info('update user with id: ', userId);
        try {
            const connection = await getConnection();
            const result = await query(
                `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', isActive = '${user.isActive}', emailAdress = '${user.emailAdress}', password = '${user.password}', phoneNumber = '${user.phoneNumber}', roles = '${user.roles}', street = '${user.street || ''}', city = '${user.city || ''}' WHERE id = ${userId};`, 
                connection
            );
            logger.trace(`User updated with id ${userId}.`);
                callback(null, {
                    status: 200,
                    message: `User updated with id ${userId}.`,
                    data: user
                });
        } catch (err) {
            logger.info('error updating user: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    delete: async (userId, callback) => {
        logger.info('deleting user with id: ', userId);
        try {
            const connection = await getConnection();
            const result = await query(
                `DELETE FROM user WHERE id = ${userId};`, 
                connection
            );
            logger.trace(`User deleted with id ${userId}.`);
            callback(null, {
                status: 200,
                message: `User deleted with id ${userId}.`,
            });
        } catch (err) {
            logger.info('error deleting user: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getAll: async (callback) => {
        logger.info('getAll');
        try {
            const connection = await getConnection();
            const result = await query(
                `SELECT * FROM user;`, 
                connection
            );
            callback(null, {
                status: 200,
                message: `Found ${result.length} users.`,
                data: result
            });
        } catch (err) {
            callback(err, null);
        }
    },

    getById: async (userId, callback) => {
        logger.info('get info from user with id: ' + userId);
        try {
            const connection = await getConnection();
            const result = await query(
                `SELECT * FROM user WHERE id = ${userId};`, 
                connection
            );
            callback(null, {
                status: 200,
                message: `Found user with id: ${userId}.`,
                data: result
            });
        } catch (err) {
            callback(err, null);
        }
    },

    login: async (login, callback) => {
        logger.trace(`userService: login ${login.emailAdress}`);
        try {
            const connection = await getConnection();
            const data = await query(
                `SELECT * FROM user WHERE emailAdress = '${login.emailAdress}';`,
                connection
            );
            if (data[0].password === login.password && data && data.length === 1) {
                logger.trace('passwords matched, sending user info and token');
                const { password, ...userinfo } = data[0];
                const payload = { userId: userinfo.id };
                const token = await sign(payload, process.env.JWT_KEY, {expiresIn: '12d'});
                callback(null, {
                    status: 200,
                    message: `Login successful!`,
                    data: { ...userinfo, token}
                });
            } else {
                throw { status: 409, message: 'User not found or password invalid', data: {}};
            }
        } catch (err) {
            callback(err, null);
        }
    }
}

export default userService;