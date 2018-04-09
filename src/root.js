
const Router = require('koa-router');

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.type = 'html';
  ctx.body = '<h1>Hello World</h1>';
});

module.exports = router;
