import { Router } from 'express'
import assert from 'assert'
import { should, expect } from 'chai'
import controller from '../controllers/user.controller.js'
import logger from '../logger.js'

should();
const router = Router();

const notFound = (req, res, next) => {
    res.status(400).send({
        status: 400,
        message: ex.message,
        data: {}
    });
}

const validateUser = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field');
        expect(req.body.firstName).to.not.be.empty;
        expect(req.body.firstName).to.be.a('string');
        expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        );

        assert(req.body.lastName, 'Missing or incorrect lastName field');
        expect(req.body.lastName).to.not.be.empty;
        expect(req.body.lastName).to.be.a('string');
        expect(req.body.lastName).to.match(
            /^[a-zA-Z]+$/,
            'lastName must be a string'
        );

        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field');
        expect(req.body.emailAdress).to.not.be.empty;
        expect(req.body.emailAdress).to.be.a('string');
        expect(req.body.emailAdress).to.match(
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'emailAdress must be a correct email'
        );

        assert(req.body.isActive, 'Missing or incorrect isActive field');
        expect(req.body.isActive).to.not.be.undefined;
        expect(req.body.isActive).to.be.a('number');
        expect(req.body.isActive).to.match(
            /^[01]$/,
            'emailAdress must be a correct email'
        );

        assert(req.body.password, 'Missing or incorrect password field');
        expect(req.body.password).to.not.be.empty;
        expect(req.body.password).to.be.a('string');
        expect(req.body.password).to.have.lengthOf.above(3);

        assert(req.body.phoneNumber, 'Missing or incorrect phone number field');
        expect(req.body.phoneNumber).to.not.be.empty;
        expect(req.body.phoneNumber).to.be.a('string');
        expect(req.body.phoneNumber).to.match(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
            'phone number must be a string'
        );

        assert(req.body.roles, 'Missing or incorrect roles field');
        expect(req.body.roles).to.not.be.empty;
        expect(req.body.roles).to.be.a('string');

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

const validateUserId = (req, res, next) => {
    try {
        assert(req.params.userId, 'Missing or incorrect id!');
        expect(req.params.userId).to.not.be.empty;
        expect(parseInt(req.params.userId)).to.be.a('number');
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

router.get('/api/user', controller.getAll);
router.get('/api/user/:userId', validateUserId, controller.getById);

router.post('/api/user', validateUser, controller.create);
router.put('/api/user/:userId', validateUser, validateUserId,controller.update);
router.delete('/api/user/:userId', validateUserId ,controller.delete);

export default router;