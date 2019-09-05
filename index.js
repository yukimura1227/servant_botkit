const Botkit = require('botkit');

if (!process.env.TOKEN) {
  console.log('Error: Specify TOKEN in environment');
  process.exit(1);
}

if (!process.env.SLACK_TEAM) {
  console.log('Error: Specify SLACK_TEAM in environment');
  process.exit(1);
}

const controller = Botkit.slackbot({
  debug: false
});

controller.spawn({
  token: process.env.TOKEN

}).startRTM( function(err) {
  if (err) {
    throw new Error(err);
  }

});

const hearing_event_all            = ['ambient'];
const hearing_event_mention        = ['direct_mention', 'mention'];
const hearing_event_direct_message = ['direct_message'];

controller.hears('hi', hearing_event_mention, function(bot,message) {
  bot.reply(message,'hi');
});

controller.hears('', hearing_event_all, function(bot,message) {
  // console.log(bot);
  console.log(message);
  var id = message.client_msg_id;
  var slack_team = process.env.SLACK_TEAM;
  var channel_id = message.channel;
  var event_ts = message.event_ts;
  event_ts = event_ts.replace('.','')
  var url_parameter = `?thread_ts=${message.thread_ts}&cid=${channel_id}`
  var post_link = `https://${slack_team}.slack.com/archives/${channel_id}/p${event_ts}`
  var channel_from_id
  bot.api.chat.postMessage({
    text: `${post_link}`,
    channel: '#random',
    as_user: false,
    username: bot.identity.name,
    unfurl_links: true
  }, function(err, message){
    if(err) { console.log("err: ", err); return; }
  });
});
