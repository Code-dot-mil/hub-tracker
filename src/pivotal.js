
const Router = require('koa-router');
const request = require('request-promise-native');

const router = new Router({
  prefix: '/pivotal'
});

const OAUTH_TOKEN = process.env.GH_OAUTH_TOKEN;
const OWNER_REPO = process.env.GH_OWNER_REPO;
const API_TOKEN = process.env.PT_API_TOKEN;
const PROJECT_ID = process.env.PT_PROJECT_ID;

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
    ctx.body = `No handler for request kind: ${ctx.request.body.kind}`;
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
    if (msg === null) {
      console.log(`No handler for request type: ${ctx.request.body.changes[0] && ctx.request.body.changes[0].change_type}`);
      ctx.body = `No handler for request type: ${ctx.request.body.changes[0] && ctx.request.body.changes[0].change_type}`;
    } else {
      ctx.body = { msg };
    }
  } catch(err) {
    console.error(`Error from GitHub API for ${ctx.request.body.kind}`, err);
    ctx.body = { msg: 'Error while handling Pivotal webhook', err };
  }
});

const handlers = {

  story_update_activity: async (data) => {
    const update = data.changes.filter((change) => change.change_type === 'update')[0];

    if (update.new_values.current_state && update.new_values.current_state === 'finished') {
      console.log(`Closing GH issue for PT story ${update.id}`);

      // TODO: remove this... for now we'll just log the event.
      return `GH issue commented and closed: ID=???`;

      // const ptStory = await request({
      //   method: 'GET',
      //   headers: {
      //     'User-Agent': 'hub-tracker',
      //     'X-TrackerToken': API_TOKEN,
      //     'Content-Type': 'application/json'
      //   },
      //   uri: `https://www.pivotaltracker.com/services/v5/projects/${PROJECT_ID}/stories/${update.id}`,
      //   json: true
      // });
      //
      // const ghIssueId = ptStory.description.match(/\[GH \[#([0-9]+)\]/);
      // if (ghIssueId) {
      //   const ghIssueComment = await request({
      //     method: 'POST',
      //     headers: {
      //       'User-Agent': 'hub-tracker',
      //       Authorization: `token ${OAUTH_TOKEN}`
      //     },
      //     uri: `https://api.github.com/repos/${OWNER_REPO}/issues/${ghIssueId[1]}/comments`,
      //     body: {
      //       body: `Issue marked complete in Pivotal Tracker [#${update.id}]`
      //     },
      //     json: true
      //   });
      //
      //   const ghIssueClose = await request({
      //     method: 'PATCH',
      //     headers: {
      //       'User-Agent': 'hub-tracker',
      //       Authorization: `token ${OAUTH_TOKEN}`
      //     },
      //     uri: `https://api.github.com/repos/${OWNER_REPO}/issues/${ghIssueId[1]}/`,
      //     body: {
      //       state: 'closed'
      //     },
      //     json: true
      //   });
      //
      //   return `GH issue commented and closed: ID=${ghIssueId[1]}`;
      // } else {
      //   return `Story has no GH issue associated`;
      // }
    }

    return null;
  }

};

module.exports = router;
