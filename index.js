const Botkit = require('botkit');
const request = require('request')

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
  var id = message.client_msg_id;
  var slack_team = process.env.SLACK_TEAM;
  var channel_id = message.channel;
  var event_ts = message.event_ts;
  event_ts = event_ts.replace('.','')
  var url_parameter = `?thread_ts=${message.thread_ts}&cid=${channel_id}`
  var post_link = `https://${slack_team}.slack.com/archives/${channel_id}/p${event_ts}`
  var URL = `https://slack.com/api/channels.info?token=${process.env.TOKEN}&channel=${channel_id}`
  request(URL, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let channel_info = JSON.parse(body);
      // console.log(channel_info);
      var channel_name =  channel_info.channel.name;

      if(channel_name.match('^times_.+')) {
        repost_to('#timeline', bot, post_link, message);
      }

      if (channel_name.match('^日報_(.*)$') && channel_name.match('_').length === 1/* && username !== 'slackbot'*/) {
        repost_to('#日報_all', bot, post_link, message);
      }

      if (channel_name.match('^日報_(.*)_.+')) {
        matcher = channel_name.match('^日報_(.*)_.+');
        repost_to(`#日報_${matcher[1]}`, bot, post_link, message);
        repost_to('#日報_all', bot, post_link, message);
      }
    }
  });
});

function repost_to(channel, bot, post_link, message) {
  console.log(message);
  bot.api.chat.postMessage({
    text: `${post_link}`,
    channel: channel,
    as_user: true,
    unfurl_links: true
  }, function(err, message){
    if(err) { console.log("err: ", err); return; }
  });
}