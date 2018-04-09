
const Router = require('koa-router');

const router = new Router({
  prefix: '/pivotal'
});

router.get('/', (ctx) => {
  ctx.type = 'text';
  ctx.body = 'Pivotal Stuff';
});

module.exports = router;
