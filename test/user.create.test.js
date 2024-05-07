import { should, expect, use } from 'chai';
import chaiHttp from 'chai-http'
import server from '../server.js'
import { setLevel } from 'tracer'

should();
const chaiServer = use(chaiHttp);
setLevel('warn');

const endpointToTest = '/api/user';

describe('UC201 Registreren als nieuwe user', () => {
    beforeEach((done) => {
        console.log('Before each test');
        done();
    });

    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        const data = {
            lastName: 'Achternaam',
            emailAdress: 'v.a@server.nl'
        };
        chaiServer.request(server)
            .post(endpointToTest)
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).not.to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(400);
                expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field');
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;

                done();
            });
    });

    it('TC-201-2 Niet-valide email adres', (done) => {
        const data = {
            firstName: 'Voornaam',
            lastName: 'Achternaam',
            emailAdress: 'poasjodfioaserfioashj'
        };
        chaiServer.request(server)
            .post(endpointToTest)
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).not.to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(400);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`emailAdress must be a correct email: expected '${data.emailAdress}' to match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/`);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;

                done();
            });
    });

    it.skip('TC-201-3 Niet-valide password', (done) => {
        done();
    });

    it('TC-201-4 Gebruiker bestaat al', (done) => {
        const data = {
            firstName: 'Voornaam',
            lastName: 'Achternaam',
            emailAdress: 'hvd@server.nl'
        };
        chaiServer.request(server)
            .post(endpointToTest)
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res).not.to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(500);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`The email: ${data.emailAdress} already exists!`);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;

                done();
            })
    });

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chaiServer.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');

                res.body.should.have.property('data').that.is.a('object');
                res.body.should.have.property('message')
                    .to.match(/^User created with id [0-9]+./);

                const returnedData = res.body.data
                returnedData.should.have.property('firstName').equals('Voornaam');
                returnedData.should.have.property('lastName').equals('Achternaam');
                returnedData.should.have.property('emailAdress').equals('v.a@server.nl');
                returnedData.should.have.property('id').that.is.a('number');

                done();
            });
    });
});

describe('UC202 Opvragen van overzicht van users', () => {
    beforeEach((done) => {
        console.log('Before each test');
        done();
    });

    it('TC-202-1 opvragen van alle users', (done) => {
        chaiServer.request(server)
            .get(endpointToTest)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(200);
                expect(res.body)
                    .to.have.property('message')
                    .to.match(/^Found [0-9]+ users./);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('array').to.have.lengthOf.above(2);

                done();
            });
    });
});

describe('UC203 Opvragen van user data', () => {
    
    beforeEach((done) => {
        console.log('Before each test');
        done();
    });

    it('TC-203-1 opvragen van user data met valide id', (done) => {
        const id = 1;
        chaiServer.request(server)
            .get(endpointToTest + "/" + id)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(200);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`Found user with id ${id} .`);
                    const returnedData = res.body.data
                    returnedData.should.have.property('firstName').equals('Marieke');
                    returnedData.should.have.property('lastName').equals('Jansen');
                    returnedData.should.have.property('emailAdress').equals('m@server.nl');
                    returnedData.should.have.property('id').that.is.a('number');
                done();
            });
    });

    it('TC-203-2 opvragen van user data met niet valide id', (done) => {
        const id = -1;
        chaiServer.request(server)
            .get(endpointToTest + "/" + id)
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res).to.not.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(500);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`Error: id ${id} does not exist!`);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;
                done();
            });
    });
});

describe('UC204 Wijzigen van usergegeven', () => {
    const id = 0;
    beforeEach((done) => {
        console.log('Before each test');
        done();
    });

    it('TC-204-1 Verplicht veld ontbreekt', (done) => {
        const data = {
            lastName: 'Achternaam',
            emailAdress: 'v.a@server.nl'
        };
        chaiServer.request(server)
            .put(endpointToTest + '/' + id)
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).not.to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(400);
                expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field');
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;

                done();
            });
    });

    it('TC-204-2 Niet-valide email adres', (done) => {
        const data = {
            firstName: 'Voornaam',
            lastName: 'Achternaam',
            emailAdress: 'poasjodfioaserfioashj'
        };
        chaiServer.request(server)
            .put(endpointToTest + '/' + id)
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).not.to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(400);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`emailAdress must be a correct email: expected '${data.emailAdress}' to match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/`);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;

                done();
            });
    });

    it.skip('TC-204-3 Niet-valide password', (done) => {
        done();
    });

    it('TC-204-4 email bestaat al', (done) => {
        const data = {
            firstName: 'Voornaam',
            lastName: 'Achternaam',
            emailAdress: 'hvd@server.nl'
        };
        chaiServer.request(server)
            .put(endpointToTest + '/' + id)
            .send(data)
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res).not.to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(500);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`The email: ${data.emailAdress} already exists!`);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;

                done();
            });
    });

    it('TC-204-5 wijzigen van user data met niet valide id', (done) => {
        const id = -1;
        chaiServer.request(server)
            .put(endpointToTest + "/" + id)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'other@server.nl'
            })
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res).to.not.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(500);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`Error: id ${id} does not exist!`);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;
                done();
            });
    });

    it('TC-204-6 Gebruiker succesvol gewijzigt', (done) => {
        chaiServer.request(server)
            .put(endpointToTest + '/' + id)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'other@server.nl'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');

                res.body.should.have.property('data').that.is.a('object');
                res.body.should.have.property('message')
                    .to.match(/^User updated with id [0-9]+./);

                const returnedData = res.body.data
                returnedData.should.have.property('firstName').equals('Voornaam');
                returnedData.should.have.property('lastName').equals('Achternaam');
                returnedData.should.have.property('emailAdress').equals('other@server.nl');
                returnedData.should.have.property('id').that.is.a('number');

                done();
            });
    });
});

describe('UC205 deleting van user data', () => {
    
    beforeEach((done) => {
        console.log('Before each test');
        done();
    });

    it('TC-205-1 verwijderen van user data met valide id', (done) => {
        const id = 1;
        chaiServer.request(server)
            .del(endpointToTest + "/" + id)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(200);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`User deleted with id ${id}.`);
                done();
            });
    });

    it('TC-205-2 verwijderen van user data met niet valide id', (done) => {
        const id = -1;
        chaiServer.request(server)
            .get(endpointToTest + "/" + id)
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res).to.not.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').equals(500);
                expect(res.body)
                    .to.have.property('message')
                    .equals(`Error: id ${id} does not exist!`);
                expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty;
                done();
            });
    });
});