import jwt from 'jsonwebtoken';
import logger from './logger.js';

function verify(token, key) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, key, (err, payload) => {
            if (err) {
                reject(err);
            }
            if (payload) {
                resolve(payload);
            }
        });
    });
}

export async function validateToken(req, res, next) {
    logger.info('validateToken called');
    logger.trace('Headers:', req.headers);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        logger.info('Authorization header missing!');
        next({
            status: 401,
            message: 'Authorization header missing!',
            data: {}
        });
    } else {
        try {
            const token = authHeader.substring(7, authHeader.length);
            const payload = await verify(token, process.env.JWT_KEY);
            res.locals.userId = payload.userId;
            logger.debug('token is valid', payload);
            next();
        } catch (err) {
            logger.info(err);
            logger.info('Not authorized');
            next({
                status: 401,
                message: 'Not authorized!',
                data: {}
            });
        }
    }
}