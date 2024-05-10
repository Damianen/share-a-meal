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
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

const endpointToTest = '/api/user';

describe('UC-201 - UC-205', () => {
    beforeEach((done) => {
        logger.debug('Before done');
        done();
    });

    describe('UC-201 Registration for new user', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-201-1 Required field missing', (done) => {
            chaiServer.request(server)
                .post(endpointToTest)
                .send({
                    //firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Missing or incorrect firstName field');
                    done();
                });
        });

        it('TC-201-2 Not valid email', (done) => {
            chaiServer.request(server)
                .post(endpointToTest)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "NotAValidEmail",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.contain("emailAdress must be a correct email:");
                    done();
                });
        });

        it('TC-201-3 Not valid password', (done) => {
            chaiServer.request(server)
                .post(endpointToTest)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "12",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.contain("expected '12' to have a length above 3 but got ");
                    done();
                });
        });

        it('TC-201-4 User already exists', (done) => {
            chaiServer.request(server)
                .post(endpointToTest)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "name@server.nl", // email already exists
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(403);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.contain('Duplicate entry');
                    done();
                });
        });

        it('TC-201-5 User successfully added', (done) => {
            chaiServer.request(server)
                .post(endpointToTest)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(201);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.not.empty;
                    res.body.message.should.contain('User created with id');
                    done();
                });
        });
    });

    describe('UC-202 Registration for new user', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_USER2).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-202-1 show all users', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest)
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('array').that.is.not.empty.and.is.lengthOf.above(2);
                    res.body.message.should.contain('Found 2 users');
                    done();
                });
        });

        it('TC-202-2 show users with search query with none existent fields', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + '?jo=jo&jf=jf')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('array').that.is.not.empty.and.is.lengthOf.above(2);
                    res.body.message.should.contain('Invalid query fields');
                    done();
                });
        });

        it('TC-202-3 show users with search query isActive = false', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + '?isActive=false')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('array').that.is.empty;
                    res.body.message.should.contain('Found 0 users');
                    done();
                });
        });

        it('TC-202-4 show users with search query isActive = true', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + '?isActive=true')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('array').that.is.not.empty.and.is.lengthOf.above(2);
                    res.body.message.should.contain('Found 2 users');
                    done();
                });
        });

        it('TC-202-5 show users with search query with existing fields', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + '?firstName=first&lastName=last')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('array').that.is.not.empty.and.is.lengthOf.above(2);
                    res.body.message.should.contain('Found 2 users');
                    done();
                });
        });
    });

    describe('UC-203 Requesting user profile', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_USER2).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-203-1 invalid token', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + "/profile")
                .set('Authorization', 'Bearer ' + "isdkjfgosjdk")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.contain('Not authorized!');
                    done();
                });
        });

        it('TC-203-2 user is logged in with valid token', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + "/profile")
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.not.empty;
                    res.body.message.should.contain('Found user with id: 1.');
                    done();
                });
        });
    });

    describe('UC-204 Requesting user info with id', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_USER2).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-204-1 invalid token', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + "/1")
                .set('Authorization', 'Bearer ' + "isdkjfgosjdk")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.contain('Not authorized!');
                    done();
                });
        });

        it('TC-204-2 user id does not exist', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + "/3")
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.contain('User with id: 3 not found!');
                    done();
                });
        });

        it('TC-204-3 user is logged in with valid token', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .get(endpointToTest + "/1")
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.not.empty;
                    res.body.message.should.contain('Found user with id: 1.');
                    done();
                });
        });
    });

    describe('UC-205 Updating user info', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_USER2).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-205-1 Required field missing', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    //emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Missing or incorrect emailAdress field');
                    done();
                });
        });

        it('TC-205-2 User is not owner of data', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/2')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(403);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Not authorized to update this profile');
                    done();
                });
        });

        it('TC-205-3 Not valid phone number', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "not a valid phone number",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.contain("phone number must be a correct phone number:");
                    done();
                });
        });

        it('TC-205-4 id does not exist', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/3')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('User with id: 3 not found!');
                    done();
                });
        });

        it('TC-205-5 User is not logged in', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/2')
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
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

        it('TC-205-6 User successfully updated', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .put(endpointToTest + '/1')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: "damian",
                    lastName: "last",
                    emailAdress: "damian@gmail.com",
                    isActive: 1,
                    password: "cool",
                    phoneNumber: "0612345678",
                    roles: "editor"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.not.empty;
                    res.body.message.should.contain('User updated with id');
                    done();
                });
        });
    });

    describe('UC-206 Deleting user info', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                query(CLEAR_DB + INSERT_USER + INSERT_USER2).then(() => done());
            } catch (err) {
                throw err;
            }
        });

        it('TC-206-1 id does not exist', (done) => {
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
                    res.body.message.should.equal('User with id: 3 not found!');
                    done();
                });
        });

        it('TC-206-2 User not logged in', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .delete(endpointToTest + '/1')
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

        it('TC-206-3 user is not owner of data', (done) => {
            const token = jwt.sign({ userId: 1}, process.env.JWT_KEY);
            chaiServer.request(server)
                .delete(endpointToTest + '/2')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(403);
                    res.body.should.be.an.an('object')
                        .that.has.all.keys('status', 'message', 'data');
                    res.body.status.should.be.a('number');
                    res.body.data.should.be.an('object').that.is.empty;
                    res.body.message.should.equal('Not authorized to delete this profile!');
                    done();
                });
        });

        it('TC-206-3 user is not owner of data', (done) => {
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
                    res.body.message.should.equal('User deleted with id 1.');
                    done();
                });
        });
    });
});