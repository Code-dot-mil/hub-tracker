
const Router = require('koa-router');
const request = require('request-promise-native');

const router = new Router({
  prefix: '/github'
});

const OAUTH_TOKEN = process.env.PT_OAUTH_TOKEN;
const BOARD_ID = process.env.PT_BOARD_ID;

router.use(async (ctx, next) => {
  if (!ctx.request.body || typeof(ctx.request.body) !== 'object') {
    ctx.status = 400;
    ctx.body = 'Bad webhook data from GitHub';
    console.error(`Bad webhook data from GitHub (first 300 bytes): ${JSON.stringify(ctx.request.body).substr(0,300)}`);
    return;
  }
  await next();
});

router.use(async (ctx, next) => {
  ctx.request.eventType = `${ctx.request.header['x-github-event']}_${ctx.request.body.action}`;
  if (!handlers[ctx.request.eventType] || typeof(handlers[ctx.request.eventType]) !== 'function') {
    ctx.status = 200;
    ctx.type = 'text';
    ctx.body = `No handler for event action: ${ctx.request.eventType}`;
    console.log(`No handler for event action: ${ctx.request.eventType}`);
    return;
  }
  await next();
});

router.post('/', async (ctx) => {
  // If get to here, we'll always return 200 since the webhook did work
  // even if the GitHub connection doesn't
  ctx.status = 200;
  ctx.type = 'json';

  try {
    const msg = await handlers[ctx.request.eventType](ctx.request.body)
    ctx.body = { msg };
  } catch(err) {
    console.error(`Error from Pivotal API for ${ctx.request.eventType}`, err);
    ctx.body = { msg: 'Error while handling GitHub webhook', err };
  }
});

const handlers = {
  issues_opened: async (data) => {
    // TODO: finish this

    return `Added new Pivotal story: ID=13`;
  }
};

module.exports = router;
