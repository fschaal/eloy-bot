var request = require('request')

module.exports = function() {
  return new Advice()
}

function Advice() {
  var self = this

  self.GetAdvice = function(subject, fn) {
    if (subject) {
      var url = 'http://api.adviceslip.com/advice/search/' + subject
    } else {
      var url = 'http://api.adviceslip.com/advice'
    }
    console.log(url)
    request({
        url: url,
        json: true,
        rejectUnauthorized: false
      }, function(error, response, data) {
        if (error) {
          return fn(error)
        }
        if (response.statusCode !== 200) {
          return fn(new Error('unexpected status ' + response.statusCode))
        }
        if (subject) {
          if (data.message) {
            var msg = 'uh, thats a complicated topic! I\'m afraid I have no advice for you.:confused:'
            return fn(null, msg)
          }
          var randomNumber = Math.floor((Math.random() * data.total_results))
          console.log(randomNumber)
          var msg = data.slips[randomNumber].advice
          return fn(null, msg)
        }

        var msg = data.slip.advice
        return fn(null, msg)
      })
    }
  }
