import { Router } from 'express';
import assert from 'assert';
import { should, expect } from 'chai';
import logger from '../logger.js';
import { validateToken } from '../auth.js';
import { notFound } from './404.route.js';
import mealController from '../controllers/meal.controller.js';

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

const validateMeal = (req, res, next) => {
    try {
        assert(req.body.isActive, 'Missing or incorrect is active field');
        expect(req.body.isActive).to.not.be.undefined;
        expect(req.body.isActive).to.be.a('number');
        expect(req.body.isActive).to.match(
            /^[01]$/,
            'is active must be a correct 0 or 1'
        );

        assert(req.body.isVega, 'Missing or incorrect is vega field');
        expect(req.body.isVega).to.not.be.undefined;
        expect(req.body.isVega).to.be.a('number');
        expect(req.body.isVega).to.match(
            /^[01]$/,
            'is vega must be a correct 0 or 1'
        );

        assert(req.body.isVegan, 'Missing or incorrect is vegan field');
        expect(req.body.isVegan).to.not.be.undefined;
        expect(req.body.isVegan).to.be.a('number');
        expect(req.body.isVegan).to.match(
            /^[01]$/,
            'is vegan must be a correct 0 or 1'
        );

        assert(req.body.isToTakeHome, 'Missing or incorrect is to take home field');
        expect(req.body.isToTakeHome).to.not.be.undefined;
        expect(req.body.isToTakeHome).to.be.a('number');
        expect(req.body.isToTakeHome).to.match(
            /^[01]$/,
            'is to take home must be a correct 0 or 1'
        );

        assert(req.body.dateTime, 'Missing or incorrect date time field');
        expect(req.body.dateTime).to.not.be.empty;
        expect(req.body.dateTime).to.be.a('String');
        

        assert(req.body.maxAmountOfParticipants, 'Missing or incorrect max amount of participants field');
        expect(req.body.maxAmountOfParticipants).to.not.be.undefined;
        expect(req.body.maxAmountOfParticipants).to.be.a('number').that.is.above(1);

        assert(req.body.price, 'Missing or incorrect price field');
        expect(req.body.price).to.not.be.undefined;
        expect(req.body.price).to.be.a('number').that.is.above(0);

        assert(req.body.imgURL, 'Missing or incorrect image URL');
        expect(req.body.imgURL).to.not.be.empty;
        expect(req.body.imgURL).to.be.a('String');
        expect(req.body.imgURL).to.match(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'image URL must be a correct URL'
        );

        assert(req.body.createDate, 'Missing or incorrect create date field');
        expect(req.body.createDate).to.not.be.empty;
        expect(req.body.createDate).to.be.a('String');
        

        assert(req.body.name, 'Missing or incorrect name field');
        expect(req.body.name).to.not.be.empty;
        expect(req.body.name).to.be.a('String');

        assert(req.body.description, 'Missing or incorrect description');
        expect(req.body.description).to.not.be.empty;
        expect(req.body.description).to.be.a('String');

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

router.get('/api/meal', mealController.getAll);
router.get('/api/meal/:mealId', validateMealId, mealController.getById);

router.post('/api/meal', validateToken, validateMeal, mealController.create);
router.delete('/api/meal/:mealId', validateToken, validateMealId, mealController.delete);
router.put("/api/meal/:mealId", validateToken, validateMeal, validateMealId, mealController.update);

export default router;