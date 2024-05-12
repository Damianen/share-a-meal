import e, { Router } from 'express';
import assert from 'assert';
import { should, expect } from 'chai';
import logger from '../logger.js';
import { validateToken } from '../auth.js';
import { notFound } from './404.route.js';
import registrationController from '../controllers/registration.controller.js';

should();
const router = Router();

const validateMealId = (req, res, next) => {
    try {
        assert(req.params.mealId, 'Missing or incorrect id!');
        expect(req.params.mealId).to.not.be.undefined;
        expect(parseInt(req.params.mealId)).to.be.a('number');
        logger.trace('Meal successfully validated');
        next();
    } catch (ex) {
        logger.trace('Meal validation failed:', ex.message)
        res.status(400).send({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateParticipantId = (req, res, next) => {
    try {
        assert(req.params.participantId, 'Missing or incorrect id!');
        expect(req.params.participantId).to.not.be.empty;
        expect(parseInt(req.params.participantId)).to.be.a('number');
        logger.trace('User successfully validated');
        next();
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        res.status(400).send({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

router.post("/api/meal/:mealId/participate", validateToken, validateMealId, registrationController.create);
router.delete("/api/meal/:mealId/participate", validateToken, validateMealId, registrationController.delete);

router.get("/api/meal/:mealId/participants", validateMealId, registrationController.getAllParticipants);
router.get("/api/meal/:mealId/participants/:participantId", validateMealId, validateParticipantId, registrationController.getParticipantById);

export default router;