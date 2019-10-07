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

controller.hears('remote', ['direct_mention'], function(bot, message) {
  bot.reply(message, "<!channel> 本日リモートありなので、*今日やろうと思っていること*と、*実際にやったこと*を、このメッセージのスレッドに返信する形で共有しませう");
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

      const key = process.env.TRELLO_KEY;
      const token=process.env.TRELLO_TOKEN;
      const ui_note=process.env.TRELLO_UI_NOTE;
      const list_new_id=process.env.TRELLO_LIST_NEW_ID;
      const bot_room = 'ui_notes'
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

          bot.reply(message,"uiチームのタスクに登録されました。随時取り掛かります。" +'\n' + "https://trello.com/b/jrmkblAB/uinotes")

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
