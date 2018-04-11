
const Router = require('koa-router');

const router = new Router({
  prefix: '/pivotal'
});

router.use((ctx, next) => {
  if (!ctx.request.body || typeof(ctx.request.body) !== 'object') {
    ctx.status = 400;
    ctx.body = 'Bad webhook data from Pivotal';
    console.error(`Bad webhook data from Pivotal (first 300 bytes): ${ctx.request.body.substr(0,300)}`);
    return;
  }
  next();
});

router.use((ctx, next) => {
  if (!handlers[ctx.request.body.kind] || typeof(handlers[ctx.request.body.kind]) !== 'function') {
    ctx.status = 200;
    ctx.body = 'No handler for request kind';
    console.log(`No handler for request kind: ${ctx.request.body.kind.substr(0,100)}`);
    return;
  }
  next();
});

router.post('/', (ctx) => {
  const msg = handlers[ctx.request.body.kind]();

  ctx.status = 200;
  ctx.type = 'json';
  ctx.body = { msg };
});

const handlers = {
  story_create_activity: (data) => {
    return 'Added new GH issue'
  }
};

module.exports = router;
