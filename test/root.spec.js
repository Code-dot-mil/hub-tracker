
const supertest = require('supertest');
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

  test('should respond with Pivotal text on GET', async () => {
    const response = await request.get('/');
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('text/html');
    expect(response.text).toEqual('<h1>Hello World</h1>');

    return response;
  });

});
