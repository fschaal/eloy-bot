# Eloy
[![MIT License][license-image]][license-url] [![Build Status][travis-image]][travis-url]

Eloy is a slack-bot that can do home automation and assist you with a range of tasks.

## Features

###Weather
  - Get weather information
    `Whats the weather like in Spain?` / `What is the current temperature in Amsterdam?`

###Date/Time
  - Current date
    `What's today's date?` / `What date is it today?`
  - Current time
    `What time is it right now?` / `What time is it?`
  - Day of the week
    `What day are we on?` / `What day of the week is it?`

###CouchPotato
  - Search movies
    `Find me a movie called Deadpool` / `Do you know any batman movies?`
  - Get logs 
    `Show me the last error on couchpotato` / `Show me the last 10 logs on cp`

###SABnzb
  - Get queue
    `Show me my sabnzb queue.` / `How are my downloads doing on sabnzb?`

## Installation
1.  `cd` to desired install location.
2.  `git clone https://github.com/fschaal/eloy-bot.git`
3.  `npm install`
4.  If not already, create a bot on slack `https://{yourteam}.slack.com/apps/manage/custom-integrations`
5.  Fork the Eloy wit.ai repository `https://wit.ai/fschaal/eloy-bot`
6.  Set environment variable (API-Key, url, ect) for the modules you would like to use. 
    Note: SLACK_TOKEN is required for the bot to start and the WIT_TOKEN is required in order to process any sentences.
7.  `npm start`
8.  Talk to Eloy on Slack :) Eloy will be triggered by mention or direct-message.

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[travis-url]: https://travis-ci.org/fschaal/eloy-bot
[travis-image]: https://travis-ci.org/fschaal/eloy-bot.svg?branch=master
