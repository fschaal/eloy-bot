var Botkit = require('botkit')
var Witbot = require('witbot')
var CouchPotato = require('./')

var slackToken = process.env.SLACK_TOKEN
var witToken = process.env.WIT_TOKEN
var openWeatherApiKey = process.env.OPENWEATHER_TOKEN

//CouchPotato
var couchPotatoKey = process.env.COUCHPOTATO_TOKEN
var couchPotatoUrl = process.env.COUCHPOTATO_URL


var controller = Botkit.slackbot({
  debug: false
})

controller.spawn({
  token: slackToken
}).startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error('Error connecting to slack: ', err)
  }
  console.log('Connected to slack')
})

var witbot = Witbot(witToken)

controller.hears('.*', 'direct_message,direct_mention', function(bot, message) {
  var wit = witbot.process(message.text, bot, message)


  wit.hears('greetings', 0.5, function(bot, message, outcome) {
    bot.reply(message, 'Hello to you as well!')
  })


  //Weather
  var weather = require('./weather')(openWeatherApiKey)

  wit.hears('weather', 0.5, function(bot, message, outcome) {
    console.log(outcome.entities.location)
    if (!outcome.entities.location || outcome.entities.location.length === 0) {
      bot.reply(message, 'I\'d love to give you the weather but for where?')
      return
    }

    var location = outcome.entities.location[0].value
    weather.get(location, function(error, msg) {
      if (error) {
        console.error(error)
        bot.reply(message, 'uh oh, there was a problem getting the weather')
        return
      }
      bot.reply(message, msg)
    })
  })


  //CouchPotato movie search
  var couchPotato = require('./couchPotato')(couchPotatoUrl, couchPotatoKey)

  wit.hears('couchpotato_movie_search', 0.5, function(bot, message, outcome) {
    console.log(outcome.entities.search_query)
    if (!outcome.entities.search_query || outcome.entities.search_query.length === 0) {
      bot.reply(message, 'I\'d love to search for a movie but which one?:movie_camera:')
      return
    }
    var searchQuery = outcome.entities.search_query[0].value

    couchPotato.SearchMovie(searchQuery, function(error, msg) {
      if (error) {
        console.error(error)
        bot.reply(message, 'uh oh, there was a problem searching for this movie:frowning:')
        return
      }

      bot.reply(message, msg)
    })

  })
})
