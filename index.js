var Botkit = require('botkit')
var Witbot = require('witbot')
var Moment = require('moment')

//Core
var slackToken = process.env.SLACK_TOKEN
var witToken = process.env.WIT_TOKEN

//Weather
var openWeatherApiKey = process.env.OPENWEATHER_TOKEN

//CouchPotato
var couchPotatoKey = process.env.COUCHPOTATO_TOKEN
var couchPotatoUrl = process.env.COUCHPOTATO_URL

//SabNzb
var sabNzbKey = process.env.SABNZB_TOKEN
var sabNzbUrl = process.env.SABNZB_URL


var controller = Botkit.slackbot({
  debug: false
})

controller.spawn({
  token: slackToken
}).startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error('Error connecting to slack: ', err)
  }
  console.log(Moment().format('MMMM Do YYYY, h:mm:ss ') + ' Connected to slack')
})

var witbot = Witbot(witToken)

controller.hears('.*', 'direct_message,direct_mention', function(bot, message) {
  var wit = witbot.process(message.text, bot, message)


  wit.hears('greetings', 0.5, function(bot, message, outcome) {
    bot.reply(message, 'Hello to you as well!')
  })

  //moment
  wit.hears('current_time',0.5,function (bot,message,outcome) {
    bot.reply(message,'The current time is *' + Moment().format('h:mm:ss') + '*:watch:')
  })

  wit.hears('current_date',0.5,function (bot,message,outcome) {
    bot.reply(message,'Today\'s date is *' + Moment().format('MMMM Do YYYY') + '*:spiral_calendar_pad:')
  })

  wit.hears('current_datetime',0.5,function (bot,message,outcome) {
    bot.reply(message,'Today\'s date is *' + Moment().format('MMMM Do YYYY') +'*:spiral_calendar_pad:' + ' and the time is *' + Moment().format('h:mm:ss') + '*:watch:')
  })

  wit.hears('current_dayofweek',0.5,function (bot,message,outcome) {
    bot.reply(message,'Today is ' + Moment().format('dddd') + ':spiral_calendar_pad:')
  })

  //Weather
  var weather = require('./services/weather')(openWeatherApiKey)

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


  //CouchPotato
  var couchPotato = require('./services/couchPotato')(couchPotatoUrl, couchPotatoKey)

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

  wit.hears('couchpotato_logs', 0.5, function(bot, message, outcome) {
    console.log(outcome.entities.lines)
    console.log(outcome.entities.log_type)

    if (!outcome.entities.lines && !outcome.entities.log_type) {
      bot.reply(message, 'Im sorry, but I dont understand which logs I should show you.\nTry something like this: `Show me the last 30 errors from couchPotato`')
      return
    }
    if (outcome.entities.lines) {
      var lines = outcome.entities.lines[0].value
    }
    if (outcome.entities.log_type) {
      var log_type = outcome.entities.log_type[0].value
    }


    couchPotato.ShowLogs(lines, log_type, function(error, msg) {
      if (error) {
        console.log(error)
        bot.reply(message, 'uh oh, there was a problem while gathering all the log files you requested.:frowning:')
        return
      }
      bot.reply(message, msg)
    })

  })

  //SabNzb
  var sabNzb = require('./services/SABnzb')(sabNzbUrl,sabNzbKey)

  wit.hears('sabnzb_showqueue',0.5,function (bot,message,outcome) {
    console.log(outcome)
    sabNzb.GetSimpleQueue(function (error,msg) {
      if(error)
      {
        console.log(error)
        bot.reply(message,'uh oh, something went wrong here..I could not get the queue.')
        return
      }
      bot.reply(message,msg)
      return
    })

  })

  wit.otherwise(function() {
    bot.reply(message,'I\'m sorry, I did not understand..:thinking_face: I\'m still learning how to interact with humans properly.')
  })


})
