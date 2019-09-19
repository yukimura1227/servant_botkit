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
  console.log(message);
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

      // if(channel_name.match('^times_.+')) {
      //   repost_to('#timeline', bot, post_link, message);
      // }

      // if (channel_name.match('^日報_(.*)$') && channel_name.match('_').length === 1/* && username !== 'slackbot'*/) {
      //   repost_to('#日報_all', bot, post_link, message);
      // }

      // if (channel_name.match('^日報_(.*)_.+')) {
      //   matcher = channel_name.match('^日報_(.*)_.+');
      //   repost_to(`#日報_${matcher[1]}`, bot, post_link, message);
      //   repost_to('#日報_all', bot, post_link, message);
      // }

     

      const key = "7baa756dc6314bb4a1b7e3019602d0dc";
      const token="e4528b014c42038225b7324a5af99f508b1f4f5cdb1972462dcc2651323032a7";
      const ui_note="5d6e1bd5bf1ddb7a6ac7814c";
      const list_new_id="5d6e3b0cbdc0466c9eb05c85";      
      const bot_room = '西口bot実験室'
      const key_word_matcher = '^title:.*' 
      const title_matcher = '^title:([^\n]*)'
      var msg = message["text"];


      if (channel_name.match(bot_room)){
        if(msg.match(key_word_matcher)){
          if(message["files"]==null){
            var img_url = ""           
          }else{
            var img_url = message["files"][0]["url_private"];
          };
          var title = encodeURIComponent(msg.match(title_matcher)[1]);
          var desc = encodeURIComponent(msg+'\n'+img_url);
          var url = `https://trello.com/1/cards?key=${key}&token=${token}&idList=${list_new_id}&name=${title}&desc=${desc}`;
          var webclient = require("request");
          webclient.post({
            url: url,
            headers: {
              "content-type": "application/json"
            }
          }, function (error, response, body){});

          bot.reply(message,"uiチームのタスクに登録されました。随時取り掛かります。")

        };
      };
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
