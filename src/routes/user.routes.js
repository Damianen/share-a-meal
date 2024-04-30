import { Router } from 'express'
import assert from 'assert'
import { should, expect } from 'chai'
import controller from '../controllers/user.controller.js'
import logger from '../logger.js'

should();
const router = Router();

const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    });
}

const validateUserCreate = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field');
        expect(req.body.firstName).to.not.be.empty.and;
        expect(req.body.firstName).to.be.a('string');
        expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        );
        assert(req.body.lastName, 'Missing or incorrect lastName field');
        expect(req.body.lastName).to.not.be.empty.and;
        expect(req.body.lastName).to.be.a('string');
        expect(req.body.lastName).to.match(
            /^[a-zA-Z]+$/,
            'lastName must be a string'
        );
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field');
        expect(req.body.emailAdress).to.not.be.empty.and;
        expect(req.body.emailAdress).to.be.a('string');
        expect(req.body.emailAdress).to.match(
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'emailAdress must be a correct email'
        );
        logger.trace('User successfully validated');
        next();
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateUserUpdate = (req, res, next) => {
    try {
        assert(req.params.userId, 'Missing or incorrect id!');
        expect(req.params.userId).to.not.be.empty.and;
        expect(parseInt(req.params.userId)).to.be.a('number');
        logger.trace('User successfully validated');
        next();
        assert(req.body.firstName, 'Missing or incorrect firstName field');
        expect(req.body.firstName).to.not.be.empty.and;
        expect(req.body.firstName).to.be.a('string');
        expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        );
        assert(req.body.lastName, 'Missing or incorrect lastName field');
        expect(req.body.lastName).to.not.be.empty.and;
        expect(req.body.lastName).to.be.a('string');
        expect(req.body.lastName).to.match(
            /^[a-zA-Z]+$/,
            'lastName must be a string'
        );
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field');
        expect(req.body.emailAdress).to.not.be.empty.and;
        expect(req.body.emailAdress).to.be.a('string');
        expect(req.body.emailAdress).to.match(
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'emailAdress must be a correct email'
        );
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateUserId = (req, res, next) => {
    try {
        assert(req.params.userId, 'Missing or incorrect id!');
        expect(req.params.userId).to.not.be.empty.and;
        expect(parseInt(req.params.userId)).to.be.a('number');
        logger.trace('User successfully validated');
        next();
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

router.post('/api/user', validateUserCreate, controller.create);
router.get('/api/user', controller.getAll);
router.get('/api/user/:userId', validateUserId, controller.getById);

router.put('/api/user/:userId', validateUserUpdate,controller.update);
router.delete('/api/user/:userId', validateUserId ,controller.delete);

export default router;