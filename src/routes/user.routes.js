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
    if (!req.body.emailAdress || !req.body.firstName || !req.body.lastName) {
        next({
            status: 400,
            message: 'Missing email or password',
            data: {}
        });
    }
    next();
}

const validateUserCreateAssert = (req, res, next) => {
    try {
        assert(req.body.emailAdress, 'Missing email')
        assert(req.body.firstName, 'Missing or incorrect first name')
        assert(req.body.lastName, 'Missing last name')
        next();
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateUserCreateChaiShould = (req, res, next) => {
    try {
        req.body.firstName.should.not.be.empty.and.a('string')
        req.body.lastName.should.not.be.empty.and.a('string')
        req.body.emailAdress.should.not.be.empty.and.a('string').and.match(/@/)
        next();
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        expect(req.body.firstName).to.not.be.empty
        expect(req.body.firstName).to.be.a('string')
        expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        )
        logger.trace('User successfully validated')
        next()
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

router.post('/api/user', validateUserCreateChaiExpect, controller.create);
router.get('/api/user', controller.getAll);
router.get('/api/user/:userId', controller.getById);

router.put('/api/user/:userId', notFound);
router.delete('/api/user/:userId', notFound);

export default router;