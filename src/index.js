
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const root = require('./root.js');
const pivotal = require('./pivotal.js');
const github = require('./github.js');

const PORT = 3000;

const app = new Koa();

app.use(bodyParser());

app
  .use(root.routes())
  .use(pivotal.routes())
  .use(github.routes());


if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`)).on('error', (err) => {
    console.error(err);
  });
} else {
  module.exports = app;
}
