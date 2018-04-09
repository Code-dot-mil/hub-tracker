
const request = require('supertest');
const server = require('../index.js');
const creation = require('./pivotal-create.json');

describe('root URL path', () => {

  test('should respond with hello world html', async () => {
    const response = await request(server).get('/');
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('text/html');
    expect(response.text).toEqual('<h1>Hello World</h1>');
  });

});
