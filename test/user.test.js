import database from '../src/dtb/mySQLdb.js';
import server from '../server.js';
import { should, use } from 'chai';
import chaiHttp from 'chai-http';
import { setLevel } from 'tracer';
import logger from '../src/logger.js';
import { assert } from 'chai';
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

const getConnection = () => {
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }
            resolve(connection);
        });
    });
}

const query = (query, connection) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows, fields) => {
            connection.release();
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

describe('UC-201 - UC-205', () => {
    beforeEach((done) => {
        logger.debug('Before done');
        done();
    });

    describe('UC-201 Registration for new user', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            try {
                getConnection()
                    .then((connection) => query(CLEAR_DB + INSERT_USER, connection))
                    .then(done, done);
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
                    res.body.message.should.contain('ER_DUP_ENTRY: Duplicate entry');
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
                getConnection()
                    .then((connection) => query(CLEAR_DB + INSERT_USER + INSERT_USER2, connection))
                    .then(done, done);
            } catch (err) {
                throw err;
            }
        });

        it('TC-202-1 show all users', (done) => {
            chaiServer.request(server)
                .get(endpointToTest)
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
});