
const supertest = require('supertest');
const nock = require('nock');
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

  it('should skip unsupported webhook types', async () => {
    const response = await request
      .post('/pivotal')
      .send({ kind: 'foobar' });

    expect(response.status).to.equal(200);
    expect(response.type).to.equal('text/plain');
    expect(response.text).to.equal('No handler for request kind');

    return response;
  });

  it('should fail for GET requests', async () => {
    const response = await request
      .get('/pivotal');
    expect(response.status).to.equal(404);
    return response;
  });

  it('should respond with text on story creation', async () => {
    nock('https://api.github.com')
      .post('/repos/dod-ccpo/atat/issues')
      .reply(200, {
        id: 13,
        state: 'open',
        title: creation.changes[0].new_values.name,
        body: creation.changes[0].new_values.description,
        user: {
          id: 27,
          login: 'octocat'
        },
        created_at: '2018-04-10T13:33:48Z',
        updated_at: '2018-04-10T13:33:48Z'
      });

    const response = await request
      .post('/pivotal')
      .send(creation);

    expect(response.status).to.equal(200);
    expect(response.type).to.equal('application/json');
    expect(response.body).to.be.a('object');
    expect(response.body.msg).to.equal('Added new GH issue: ID=13 TS=2018-04-10T13:33:48Z');

    return response;
  });

});
