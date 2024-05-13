import query from '../src/dtb/mySQLdb.js';
import server from '../server.js';
import logger from '../src/logger.js';
import { assert } from 'chai';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import chaiServer from './meal.test.js';

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");';
const INSERT_USER2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "first", "last", "name2@server.nl", "secret", "street", "city");';

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 1, 6.50, 1);";

const INSERT_REGISTRATION = 'INSERT INTO meal_participants_user (mealId, userId) VALUES (2, 1);';

describe('UC-401 registering for meal', () => {
    const endPoint = '/api/meal/';
    beforeEach((done) => {
        logger.debug('beforeEach called');
        try {
            query(CLEAR_DB + INSERT_USER + INSERT_USER2 + INSERT_MEALS + INSERT_REGISTRATION).then(() => done());
        } catch (err) {
            throw err;
        }
    });

    it('TC-401-1 not logged in', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .post(endPoint + '1/participate')
            //.set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(401);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.empty;
                res.body.message.should.equal('Authorization header missing!');
                done();
            });
    });

    it('TC-401-2 meal does not exist', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .post(endPoint + '3/participate')
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(404);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.empty;
                res.body.message.should.equal('meal not found');
                done();
            });
    });

    it('TC-401-3 successfully registered', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .post(endPoint + '1/participate')
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(200);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.not.empty;
                res.body.message.should.contain('Registration created to meal with id:');
                done();
            });
    });

    it('TC-401-4 meal is full', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .post(endPoint + '2/participate')
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(200);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.empty;
                res.body.message.should.equal('meal is full');
                done();
            });
    });
});

describe('UC-402 deleting registration for meal', () => {
    const endPoint = '/api/meal/';
    beforeEach((done) => {
        logger.debug('beforeEach called');
        try {
            query(CLEAR_DB + INSERT_USER + INSERT_USER2 + INSERT_MEALS + INSERT_REGISTRATION).then(() => done());
        } catch (err) {
            throw err;
        }
    });

    it('TC-402-1 not logged in', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .delete(endPoint + '1/participate')
            //.set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(401);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.empty;
                res.body.message.should.equal('Authorization header missing!');
                done();
            });
    });

    it('TC-402-2 meal does not exist', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .delete(endPoint + '3/participate')
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(404);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.empty;
                res.body.message.should.equal('meal not found');
                done();
            });
    });

    it('TC-402-3 registration does not exist', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .delete(endPoint + '1/participate')
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(404);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message', 'data');
                res.body.status.should.be.a('number');
                res.body.data.should.be.an('object').that.is.empty;
                res.body.message.should.equal('registration does not exist');
                done();
            });
    });

    it('TC-402-4 successfully deleted registration', (done) => {
        const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
        chaiServer.request(server)
            .delete(endPoint + '2/participate')
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(200);
                res.body.should.be.an.an('object')
                    .that.has.all.keys('status', 'message');
                res.body.status.should.be.a('number');
                res.body.message.should.contain('Registration deleted to meal with id:');
                done();
            });
    });
});