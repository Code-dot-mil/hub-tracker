
const supertest = require('supertest');
const nock = require('nock');
const expect = require('chai').expect;
const app = require('../src/index.js');
const finish = require('./pivotal-finish.json');
const story = require('./pivotal-story.json');

const PROJECT_ID = '1234';
const OWNER_REPO = 'foo/bar';

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
    expect(response.text).to.equal('No handler for request kind: foobar');

    return response;
  });

  it('should fail for GET requests', async () => {
    const response = await request
      .get('/pivotal');
    expect(response.status).to.equal(404);
    return response;
  });

  it('should respond with text on story update', async () => {
    nock('https://www.pivotaltracker.com')
      .get(`/services/v5/projects/${PROJECT_ID}/stories/13`)
      .reply(200, story);

    nock('https://api.github.com')
      .post(`/repos/${OWNER_REPO}/issues/27/comments`)
      .reply(200, {
        id: 27
      });
    nock('https://api.github.com')
      .patch(`/repos/${OWNER_REPO}/issues/27`)
      .reply(200, {
        id: 27,
        state: 'closed'
      });

    const response = await request
      .post('/pivotal')
      .send(finish);

    expect(response.status).to.equal(200);
    expect(response.type).to.equal('application/json');
    expect(response.body).to.be.a('object');
    expect(response.body.msg).to.equal('GH issue commented and closed: ID=27');

    return response;
  });

});
