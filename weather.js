var request = require('request')

module.exports = function(token) {
  return new Weather(token)
}

function Weather(token) {
  var self = this
  self.token = token

  self.get = function(location, fn) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location +
      '&units=metric&APPID=' + self.token
    request({
      url: url,
      json: true
    }, function(error, response, data) {
      if (error) {
        return fn(error)
      }
      if (response.statusCode !== 200) {
        return fn(new Error('unexpected status ' + response.statusCode))
      }

      var currentConditions = data.weather[0].description
      var currentConditionsMain = data.weather[0].main
      var currentTemp = data.main.temp + '°C'
      var conditionIcon = ''
      console.log(currentConditionsMain);
      switch (currentConditionsMain.toLowerCase()) {
        case 'clouds':
          conditionIcon = ':cloud:'
          break;
        case 'rain':
          conditionIcon = ':rain_cloud:'
          break;
        case 'clear':
          conditionIcon = ':sunny:'
          break;
        case 'thunderstorm':
          conditionIcon = ':thunder_cloud_and_rain:'
          break;
        case 'snow':
          conditionIcon = ':snow_cloud:'
          break;
        default:

      }
      var msg = 'The weather in *' + data.name + '* is *' + currentTemp + '* and *' + currentConditions + conditionIcon + '*.'
      fn(null, msg)
    })
  }
}
