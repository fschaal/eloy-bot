var Botkit = require('botkit')
var Witbot = require('./lib/witbot')
var Moment = require('moment')
var sabNzb = require('./services/SABnzb')(sabNzbUrl, sabNzbKey)
var weather = require('./services/weather')(openWeatherApiKey)
var couchPotato = require('./services/couchPotato')(couchPotatoUrl, couchPotatoKey)
var advice = require('./services/Advice')()

var Userhelper = require('./lib/UserHelper')()

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

//localStorage
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage
  localStorage = new LocalStorage('./storage')
}

//Setting up bot
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
    if(!localStorage.getItem('user'))
    {
      console.log('** No user info found. Starting introduction!')
      bot.reply(message,'Hi there! I don\'t think we\'ve met. My name is Eloy what is your name?')
      witbot.setContext('introduction_ask_username')
      localStorage.setItem('user',JSON.stringify({name: '',birthday: ''}))
    }else {
      bot.reply(message, 'Hi ' + JSON.parse(localStorage.getItem('user')).name)
    }
    return
  })

  //Setting username
  wit.hears('introduction_username',0.5,function(bot,message,outcome) {
      var user = JSON.parse(localStorage.getItem('user'))
      if (!outcome.entities.name_person || outcome.entities.name_person === 0) {
          bot.reply(message,'oh,something strange happend. Could you tell me your name agian?')
          return
      }
      user.name = outcome.entities.name_person[0].value
      console.log('** Setting username to ' + user.name)
      localStorage.setItem('user',JSON.stringify(user))
      bot.reply(message,'Nice to meet you ' + user.name + '. ' + 'When were you born?' )
      witbot.setContext('introduction_ask_birthday')
      return
  })

  //Setting birthday
  wit.hears('introduction_birthday',0.5,function (bot,message,outcome) {
      var user = JSON.parse(localStorage.getItem('user'))
      if(!outcome.entities.datetime || outcome.entities.datetime === 0)
      {
        bot.reply(message,'hhhm:thinking_face: Lets try that again.')
        return
      }
      var birthday = outcome.entities.datetime[0].value.split('T')[0]
      console.log('** User was born on ' + birthday)
      user.birthday = birthday
      localStorage.setItem('user',JSON.stringify(user))
      Userhelper.getUserAge(birthday,function(age) {
        console.log('** User is ' + age + ' years old.')
        bot.reply(message,'Great so that means you are ' + age + 'years old! Thank you for the information:+1:')
        witbot.setContext(null)
      })

  })

  //Get user birthday
  wit.hears('user_asks_own_birthday',0.5,function (bot,message,outcome) {
    var user = JSON.parse(localStorage.getItem('user'))
    if(!user)
    {
      bot.reply(message,'I\'m sorry, I dont have any information about you. \nHow rude of me.:sweat_smile: \nLet me introduce myself.')
      bot.reply(message,'My name is Eloy. I\'m an AI that help you with your daily life. \nWhat is your name?')
      witbot.setContext('introduction_ask_username')
      return
    }
    bot.reply(message,'You should know this better then me!:neutral_face: Anyway as far as I know you where born ' + user.birthday + ':nerd_face:')
    return
  })

  //moment
  wit.hears('current_time', 0.5, function(bot, message, outcome) {
    bot.reply(message, 'The current time is *' + Moment().format('h:mm:ss') + '*:watch:')
    return
  })

  wit.hears('current_date', 0.5, function(bot, message, outcome) {
    bot.reply(message, 'Today\'s date is *' + Moment().format('MMMM Do YYYY') + '*:spiral_calendar_pad:')
    return
  })

  wit.hears('current_datetime', 0.5, function(bot, message, outcome) {
    bot.reply(message, 'Today\'s date is *' + Moment().format('MMMM Do YYYY') + '*:spiral_calendar_pad:' + ' and the time is *' + Moment().format('h:mm:ss') + '*:watch:')
    return
  })

  wit.hears('current_dayofweek', 0.5, function(bot, message, outcome) {
    bot.reply(message, 'Today is ' + Moment().format('dddd') + ':spiral_calendar_pad:')
    return
  })

  //Weather
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
  wit.hears('sabnzb_showqueue', 0.5, function(bot, message, outcome) {
    console.log(outcome)
    sabNzb.GetSimpleQueue(function(error, msg) {
      if (error) {
        console.log(error)
        bot.reply(message, 'uh oh, something went wrong here..I could not get the queue.')
        return
      }
      bot.reply(message, msg)
      return
    })

  })

  wit.hears('user_asks_advice',0.5, function(bot,message,outcome){
    console.log(outcome)

    if(outcome.entities.advice_subject)
    {
      var subject = outcome.entities.advice_subject[0].value
      console.log('** Subject given by user: ' + outcome.entities.advice_subject[0].value)
    }

    advice.GetAdvice(subject, function(error,msg) {
      if(error)
      {
        console.log(error)
        bot.reply(message,'oooh, something went wrong:thinking_face:')
        return
      }
      bot.reply(message,msg)

    })
  })


  wit.otherwise(function() {
    bot.reply(message, 'I\'m sorry, I did not understand..:thinking_face: I\'m still learning how to interact with humans properly.')
  })


})
