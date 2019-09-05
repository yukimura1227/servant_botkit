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

### heroku setup
```
heroku login
heroku create servant-botkit
heroku config:set SLACK_TEAM=[your team name]
heroku config:set TOKEN=[your token]
```
