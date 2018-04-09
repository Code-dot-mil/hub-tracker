
const supertest = require('supertest');
const app = require('../src/index.js');
const creation = require('./pivotal-create.json');

describe('pivotal URL path', () => {

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
    const response = await request.get('/pivotal');
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('text/plain');
    expect(response.text).toEqual('Pivotal Stuff');

    return response;
  });

});
