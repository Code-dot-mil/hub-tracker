
const supertest = require('supertest');
const nock = require('nock');
const expect = require('chai').expect;
const app = require('../src/index.js');
const opened = require('./github-opened.json');

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
    // nock('https://api.github.com')
    //   .post('/repos/dod-ccpo/at-at/issues')
    //   .reply(200, {
    //     id: 13,
    //     state: 'open',
    //     title: creation.changes[0].new_values.name,
    //     body: creation.changes[0].new_values.description,
    //     user: {
    //       id: 27,
    //       login: 'octocat'
    //     },
    //     created_at: '2018-04-10T13:33:48Z',
    //     updated_at: '2018-04-10T13:33:48Z'
    //   });

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
