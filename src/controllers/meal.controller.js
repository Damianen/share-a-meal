
import logger from "../logger.js";
import { validateToken } from "../auth.js";
import mealService from "../services/meal.service.js"

const mealController = {
    create: (req, res, next) => {
        logger.info("MealController: create meal");
        mealService.create(req.body, res.locals.userId, (error, success) => {
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

    delete: (req, res, next) => {
        logger.info("MealController: delete meal");
        mealService.delete(parseInt(req.params.mealId), res.locals.userId, (error, success) => {
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

    update: (req, res, next) => {
        logger.info("MealController: update meal");
        mealService.update(parseInt(req.params.mealId), req.body, res.locals.userId, (error, success) => {
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
        logger.info("MealController: get all meals");
        mealService.getAll((error, success) => {
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
        logger.info("MealController: get meal by id");
        mealService.getById(req.params.mealId, (error, success) => {
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
};

export default mealController;