
const Router = require('koa-router');
const request = require('request-promise-native');

const router = new Router({
  prefix: '/pivotal'
});

router.use(async (ctx, next) => {
  if (!ctx.request.body || typeof(ctx.request.body) !== 'object') {
    ctx.status = 400;
    ctx.body = 'Bad webhook data from Pivotal';
    console.error(`Bad webhook data from Pivotal (first 300 bytes): ${JSON.stringify(ctx.request.body).substr(0,300)}`);
    return;
  }
  await next();
});

router.use(async (ctx, next) => {
  if (!handlers[ctx.request.body.kind] || typeof(handlers[ctx.request.body.kind]) !== 'function') {
    ctx.status = 200;
    ctx.type = 'text';
    ctx.body = 'No handler for request kind';
    console.log(`No handler for request kind: ${ctx.request.body.kind && ctx.request.body.kind.substr(0,100)}`);
    return;
  }
  await next();
});

router.post('/', async (ctx) => {

  try {
    const msg = await handlers[ctx.request.body.kind](ctx.request.body)
    console.log('request handled...', msg);
    ctx.status = 200;
    ctx.type = 'json';
    ctx.body = { msg };
  } catch(err) {
    console.error(`Error from GitHub API for ${ctx.request.body.kind}`, err);
    ctx.status = 200;
    ctx.type = 'json';
    ctx.body = { msg: 'Error while handling Pivotal webhook', err };
  }
});

const handlers = {
  story_create_activity: async (data) => {
    const creation = data.changes.filter((change) => change.change_type === 'create')[0];

    const response = await request({
      method: 'POST',
      uri: 'https://api.github.com/repos/dod-ccpo/atat/issues',
      body: {
        title: creation.new_values.name,
        body: creation.new_values.description
      },
      json: true
    });

    return `Added new GH issue: ID=${response.id} TS=${response.created_at}`;
  }
};

module.exports = router;
