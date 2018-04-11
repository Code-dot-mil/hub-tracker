
const supertest = require('supertest');
const expect = require('chai').expect;
const app = require('../src/index.js');

describe('root URL path', () => {

  let request = null;
  let server = null;

  beforeEach((done) => {
    server = app.listen(done);
    request = supertest.agent(server);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('should respond with Pivotal text on GET', async () => {
    const response = await request.get('/');
    expect(response.status).to.equal(200);
    expect(response.type).to.equal('text/html');
    expect(response.text).to.equal('<h1>Hello World</h1>');

    return response;
  });

});
