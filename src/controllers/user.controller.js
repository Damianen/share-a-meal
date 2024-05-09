import userService from "../services/user.service.js";
import logger from "../logger.js";

let userController = {
    create: (req, res, next) => {
        const user = req.body;
        logger.info('create user', user.firstName, user.lastName);
        userService.create(user, (error, success) => {
            if (error) {
                next({
                    status: 403,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(201).json({...success});
            }
        })
    },

    update: (req, res, next) => {
        const updatedUser = req.body;
        const userId = parseInt(req.params.userId);
        logger.info(`Update user with id: ${userId}`);
        userService.update(userId, updatedUser, (error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({...success});
            }
        })
    },

    delete: (req, res, next) => {
        const id = parseInt(req.params.userId);
        logger.info(`Delete user with id: ${id}`);
        userService.delete(id, (error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({...success});
            }
        })
    },

    getAll: (req, res, next) => {
        logger.trace(req.query);
        logger.trace('getAll');
        userService.getAll((error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({...success});
            }
        });
    },

    getById: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        logger.trace('userController: getById', userId);
        userService.getById(userId, (error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({...success});
            }
        });
    },

    login: (req, res, next) => {
        logger.trace('userController: login', req.body.emailAdress);
        userService.login(req.body, (error, success) => {
            if (error) {
                next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({...success});
            }
        });
    }
}

export default userController;