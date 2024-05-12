import logger from "../logger.js";
import registrationService from "../services/registration.services.js";

const registrationController = {
    create: (req, res, next) => {
        logger.info("Controller: Create new registration");
        registrationService.create(parseInt(req.params.mealId), res.locals.userId, (error, success) => {
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
        logger.info("Controller: Delete registration");
        registrationService.delete(parseInt(req.params.mealId), res.locals.userId, (error, success) => {
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

    getAllParticipants: (req, res, next) => {
        logger.info("Controller: get all participants");
        registrationService.getAllParticipants(parseInt(req.params.mealId), (error, success) => {
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

    getParticipantById: (req, res, next) => {
        logger.info("Controller: get participant by id");
        registrationService.getParticipantById(parseInt(req.params.mealId), parseInt(req.params.participantId), (error, success) => {
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

export default registrationController;