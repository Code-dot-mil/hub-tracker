
const supertest = require('supertest');
const nock = require('nock');
const expect = require('chai').expect;
const app = require('../src/index.js');
const opened = require('./github-opened.json');
const story = require('./pivotal-story.json');

const PROJECT_ID = '1234';
const OWNER_REPO = 'foo/bar';

describe('github webhook', () => {

  let request = null;
  let server = null;

  beforeEach((done) => {
    server = app.listen(done);
    request = supertest.agent(server);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('should skip unsupported webhook actions', async () => {
    const response = await request
      .post('/github')
      .set('X-GitHub-Event', 'foobar')
      .send({ action: 'foobar' });

    expect(response.status).to.equal(200);
    expect(response.type).to.equal('text/plain');
    expect(response.text).to.equal('No handler for event action: foobar_foobar');

    return response;
  });

  it('should fail for GET requests', async () => {
    const response = await request
      .get('/github');
    expect(response.status).to.equal(404);
    return response;
  });

  it('should respond with text on issue creation', async () => {
    nock('https://www.pivotaltracker.com')
      .post(`/services/v5/projects/${PROJECT_ID}/stories`)
      .reply(200, story);

    const response = await request
      .post('/github')
      .set('X-GitHub-Event', 'issues')
      .send(opened);

    expect(response.status).to.equal(200);
    expect(response.type).to.equal('application/json');
    expect(response.body).to.be.a('object');
    expect(response.body.msg).to.equal('Added new Pivotal story: ID=13');

    return response;
  });

});
