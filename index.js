
const Koa = require('koa');

const PORT = 3000;

const app = new Koa();


app.use(async (ctx) => {
  ctx.body = '<h1>Hello World</h1>';
});

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`)).on('error', (err) => {
  console.error(err);
});

module.exports = server;
