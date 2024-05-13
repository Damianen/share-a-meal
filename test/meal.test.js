import query from '../src/dtb/mySQLdb.js';
import server from '../server.js';
import { should, use } from 'chai';
import chaiHttp from 'chai-http';
import { setLevel } from 'tracer';
import logger from '../src/logger.js';
import { assert } from 'chai';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

should();
const chaiServer = use(chaiHttp);
setLevel('warn');

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
    "(2, 'Meal B', 'description', 'image url', NOW(), 0, 6.50, 1);";

const endpointToTest = '/api/meal';

describe('UC-301 - UC-305', () => {
    beforeEach((done) => {
        logger.debug('Before done');
        done();
    });

    describe('UC-301 making of new meal', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-301-1 Required field missing', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .post(endpointToTest)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    //name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Missing or incorrect name field');
                    done();
                });
        });

        it('TC-301-2 not logged in', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .post(endpointToTest)
                //.set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    cookId: 1,
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
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

        it('TC-301-3 create new meal', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .post(endpointToTest)
                .set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(201);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.not.empty;
                    res.body.message.should.contain('meal created with id');
                    done();
                });
        });
    });

    describe('UC-302 editing of meal', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_MEALS).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-302-1 Required field missing', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    //name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Missing or incorrect name field');
                    done();
                });
        });

        it('TC-302-2 not logged in', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest+ '/1')
                //.set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    cookId: 1,
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
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

        it('TC-302-3 not authorized to edit', (done) => {
            const token = jwt.sign({ userId: 2}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    cookId: 1,
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(403);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Not authorized to update this meal!');
                    done();
                });
        });

        it('TC-302-4 id does not exist', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest+ '/3')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    cookId: 1,
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Meal with id: 3 not found!');
                    done();
                });
        });

        it('TC-302-5 update meal', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest+ '/1')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    isActive: 1,
                    isVega: 1,
                    isVegan: 1,
                    isToTakeHome: 1,
                    dateTime: '2023-12-31 14:30:00',
                    maxAmountOfParticipants: 10,
                    price: 10.0,
                    imgURL: "https://www.img.com",
                    createDate: '2023-12-31 14:30:00',
                    updateDate: '2023-12-31 14:30:00',
                    name: "food",
                    description: "nice food",
                    allergenes: "gluten"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(201);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.not.empty;
                    res.body.message.should.contain('meal updated with id');
                    done();
                });
        });
    });

    describe('UC-303 getting all meals', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER +  INSERT_MEALS).then(() => done()).catch((err) => console.log(err));
            } catch (err) {
                throw err;
            }
        });

        it('TC-303-1 getting all meals', (done) => {
            chaiServer.request(server)
                .get(endpointToTest)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('array').that.is.lengthOf.above(1);
                    res.body.message.should.equal('Found 2 meals.');
                    done();
                });
        });
    });

    describe('UC-304 getting meal by id', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_MEALS).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-304-1 id does not exist', (done) => {
            chaiServer.request(server)
                .get(endpointToTest + '/3')
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Meal with id: 3 not found!');
                    done();
                });
        });

        it('TC-304-2 meal with id returned', (done) => {
            chaiServer.request(server)
                .get(endpointToTest + '/1')
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.not.empty;
                    res.body.message.should.equal('Found meal with id: 1.');
                    done();
                });
        });
    });

    describe('UC-305 getting meal by id', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_MEALS).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-305-1 not logged in', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .delete(endpointToTest + '/1')
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

        it('TC-305-2 not authorized to delete', (done) => {
            const token = jwt.sign({ userId: 2}, process.env.JWT_KEY);
            chaiServer.request(server)
                .delete(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(403);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Not authorized to delete this meal!');
                    done();
                });
        });

        it('TC-305-3 id does not exist', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .delete(endpointToTest + '/3')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Meal with id: 3 not found!');
                    done();
                });
        });

        it('TC-305-4 delete success', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .delete(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message');
                    res.body.status.should.be.a('number');
                    res.body.message.should.equal('Meal deleted with id 1.');
                    done();
                });
        });
    });
});
      

export default chaiServer;