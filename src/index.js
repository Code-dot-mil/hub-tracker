
const Koa = require('koa');
const root = require('./root.js');
const pivotal = require('./pivotal.js');

const PORT = 3000;

const app = new Koa();


app
  .use(root.routes())
  .use(pivotal.routes());


if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`)).on('error', (err) => {
    console.error(err);
  });
} else {
  module.exports = app;
}
