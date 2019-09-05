const { Botkit } = require('botkit');
const { SlackAdapter } = require('botbuilder-adapter-slack');

const adapter = new SlackAdapter({
  //認証には、BotTokenだけでなく、verificationToken,
  //あるいは clientSingleSecretToken のいづれかが必要です。
  // verificationToken:process.env.SLACK_VERIFY,
  botToken: process.env.SLACK_TOKEN
});

let controller = new Botkit({
    adapter: adapter
});
