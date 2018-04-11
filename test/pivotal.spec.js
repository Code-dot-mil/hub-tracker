
const supertest = require('supertest');
const expect = require('chai').expect;
const app = require('../src/index.js');
const creation = require('./pivotal-create.json');

describe('pivotal webhook', () => {

  let request = null;
  let server = null;

  beforeEach((done) => {
    server = app.listen(done);
    request = supertest.agent(server);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('should respond with text on story creation', async () => {
    const response = await request
      .post('/pivotal')
      .send(creation);
    expect(response.status).to.equal(200);
    expect(response.type).to.equal('application/json');
    expect(response.body).to.be.a('object');
    expect(response.body.msg).to.equal('Added new GH issue');

    return response;
  });

});
