# servant_botkit
なんでもかんでもやるbotです。

## Setup
yarn

## Usage
### local
```
export SLACK_TEAM=<your slack team name here>
export TOKEN=<your slack team name here>
node index.js
```

### Required environment variables
```
# SLACK_TEAM for generate post link
SLACK_TEAM
# SLACK_API_TOKEN
TOEKN
```

## Deploy to heroku
TODO

```
heroku config:set 環境変数名=セットしたい値
heroku config:set SLACK_TEAM=aaaa
heroku config:set TOKEN=bbbb
```
