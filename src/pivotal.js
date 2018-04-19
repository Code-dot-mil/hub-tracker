
const Router = require('koa-router');
const request = require('request-promise-native');

const router = new Router({
  prefix: '/pivotal'
});

const OAUTH_TOKEN = process.env.GH_OAUTH_TOKEN;

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
  // If get to here, we'll always return 200 since the webhook did work
  // even if the GitHub connection doesn't
  ctx.status = 200;
  ctx.type = 'json';

  try {
    const msg = await handlers[ctx.request.body.kind](ctx.request.body)
    ctx.body = { msg };
  } catch(err) {
    console.error(`Error from GitHub API for ${ctx.request.body.kind}`, err);
    ctx.body = { msg: 'Error while handling Pivotal webhook', err };
  }
});

const handlers = {
  story_create_activity: async (data) => {
    const creation = data.changes.filter((change) => change.change_type === 'create')[0];

    const response = await request({
      method: 'POST',
      headers: {
        'User-Agent': 'atat-bot',
        Authorization: `token ${OAUTH_TOKEN}`
      },
      uri: 'https://api.github.com/repos/dod-ccpo/at-at/issues',
      body: {
        title: creation.new_values.name,
        body: `creation.new_values.description\n\n[PT [#${creation.new_values.id}](${data.primary_resources[0].url})]`
      },
      json: true
    });

    return `Added new GH issue: ID=${response.id} TS=${response.created_at}`;
  }
};

module.exports = router;
