import query from '../dtb/mySQLdb.js';
import logger from '../logger.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

const hash = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                reject(err);
            }
            resolve(hashedPassword);
        })
    });
}

const userService = {
    create: async (user, callback) => {
        logger.trace(`UserService: create new user with email: ${user.emailAdress}`);
        try {
            const hashedPassword = await hash(user.password);
            const result = await query(
                `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES ('${user.firstName}', '${user.lastName}', '${user.isActive}', '${user.emailAdress}', '${hashedPassword}', '${user.phoneNumber}', '${user.roles}', '${user.street || ''}', '${user.city || ''}');`,
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

    update: async (userId, validationId, user, callback) => {
        logger.trace(`UserService: update user with id: ${userId}`);
        try {
            const result = await query(
                `SELECT * FROM user WHERE id = ${validationId};`
            );
            if (!result || result.length < 1) {
                throw { status: 404, message: `User with id: ${validationId} not found!`, data: {} };
            }
            if (validationId != userId) {
                throw { status: 403, message: "Not authorized to update this profile", data: {} };
            }
            const hashedPassword = hash(user.password);
            await query(
                `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', isActive = '${user.isActive}', emailAdress = '${user.emailAdress}', password = '${hashedPassword}', phoneNumber = '${user.phoneNumber}', roles = '${user.roles}', street = '${user.street || ''}', city = '${user.city || ''}' WHERE id = ${userId};`,
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

    delete: async (userId, validationId, callback) => {
        logger.trace(`UserService: delete user with id ${userId}`);
        try {
            const result = await query(
                `SELECT * FROM user WHERE id = ${validationId};`,
            );
            if (!result || result.length < 1) {
                throw { status: 404, message: `User with id: ${validationId} not found!`, data: {} };
            }
            if (validationId != userId) {
                throw { status: 403, message: "Not authorized to delete this profile!", data: {} };
            }
            await query(
                `DELETE FROM user WHERE id = ${userId};`,
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

    getAll: async (requestQuery, callback) => {
        logger.trace(`UserService: get all users`);
        if (requestQuery.isActive) {
            requestQuery.isActive === "true" ? requestQuery.isActive = 1 : requestQuery.isActive = 0;
        }
        const queryString = Object.values(requestQuery).length != 0 ?
            `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE ${Object.keys(requestQuery)[0] + " = '" + Object.values(requestQuery)[0]}' ${Object.keys(requestQuery)[1] ? "AND " + Object.keys(requestQuery)[1] + " = '" + Object.values(requestQuery)[1] + "'" : ''};` :
            `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user;`;
        try {
            const result = await query(
                queryString,
            );
            callback(null, {
                status: 200,
                message: `Found ${result.length} users.`,
                data: result
            });
        } catch (err) {
            try {
                const result = await query(
                    `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user;`,
                );
                callback(null, {
                    status: 200,
                    message: "Invalid query fields",
                    data: result
                });
            } catch (err) {
                logger.info('error getting users: ', err.message || 'unknown error');
                callback(err, null);
            }
        }
    },

    getById: async (userId, withPassword, callback) => {
        logger.trace(`UserService: get user with id ${userId}`);
        const queryString = withPassword ? `SELECT * FROM user WHERE id = ${userId};` :
            `SELECT firstName, LastName, isActive, emailAdress, phoneNumber, roles, city, street FROM user WHERE id = ${userId};`;
        try {
            const result = await query(
                queryString,
            );
            if (!result || result.length < 1) {
                throw { status: 404, message: `User with id: ${userId} not found!`, data: {} };
            }
            callback(null, {
                status: 200,
                message: `Found user with id: ${userId}.`,
                data: result[0]
            });
        } catch (err) {
            logger.info('error getting user: ', err.message || 'unknown error');
            callback(err, null);
        }
    },

    getProfile: async (userId, callback) => {
        logger.info(`UserService: get user profile with id ${userId}`);
        try {
            const result = await query(
                `SELECT * FROM user WHERE id = ${userId};`,
            );
            callback(null, {
                status: 200,
                message: `Found user with id: ${userId}.`,
                data: result[0]
            });
        } catch (err) {
            callback(err, null);
        }
    },

    login: async (login, callback) => {
        logger.trace(`UserService: login ${login.emailAdress}`);
        try {
            const data = await query(
                `SELECT * FROM user WHERE emailAdress = '${login.emailAdress}';`,
            );
            if (!data || data.length < 1) {
                throw { status: 404, message: 'User not found', data: {} };
            } else if (!await bcrypt.compare(login.password, data[0].password)) {
                throw { status: 400, message: 'password invalid', data: {} };
            } else {
                logger.trace('passwords matched, sending user info and token');
                const { password, ...userinfo } = data[0];
                const payload = { userId: userinfo.id };
                const token = await sign(payload, process.env.JWT_KEY, { expiresIn: '12d' });
                callback(null, {
                    status: 200,
                    message: `Login successful!`,
                    data: { ...userinfo, token }
                });
            }
        } catch (err) {
            logger.info('error logging in: ', err.message || 'unknown error');

            callback(err, null);
        }
    }
}

export default userService;