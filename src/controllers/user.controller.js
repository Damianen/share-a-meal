import userService from "../services/user.service.js";
import logger from "../logger.js";

const userController = {
    create: (req, res, next) => {
        const user = req.body;
        logger.info("UserController: create user");
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
        });
    },

    update: (req, res, next) => {
        const updatedUser = req.body;
        const userId = res.locals.userId;
        logger.info("UserController: update user");
        userService.update(userId, parseInt(req.params.userId), updatedUser, (error, success) => {
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

    delete: (req, res, next) => {
        const id = res.locals.userId;
        logger.info("UserController: delete user");
        userService.delete(id, parseInt(req.params.userId), (error, success) => {
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

    getAll: (req, res, next) => {
        logger.info("UserController: getAll users");
        userService.getAll(req.query, (error, success) => {
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
        let withPassword = false;
        if (res.locals.userId === userId) {
            withPassword = true;
        }
        logger.info("UserController: get user by id");
        userService.getById(userId, withPassword, (error, success) => {
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
        logger.info("UserController: login");
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
    },

    profile: (req, res, next) => {
        logger.info("UserController: get profile");
        userService.getProfile(res.locals.userId, (error, success) => {
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
}

export default userController;