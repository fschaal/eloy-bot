var request = require('request')
var os = require('os')
var prettyBytes = require('pretty-bytes')
var moment = require('moment')

module.exports = function(url,token) {
  return new SabNzb(url,token)
}

function SabNzb(url,token) {
  var self = this
  self.url = url
  self.token = token

  self.GetSimpleQueue = function(fn) {
    var url = self.url + 'api?mode=qstatus&output=json&apikey=' + self.token

    console.log(url)
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
      console.log(data)
      if (!data.jobs || data.jobs.length === 0) {
        var msg = 'Your queue is empty!'
        fn(null, msg)
        return
      }
      var msg = 'You have currently *' + data.jobs.length + '* in your queue with a total filesize of *' + prettyBytes(data.mbleft) + '*.'
      fn(null, msg)
      if (data.paused === true) {
        var msg = 'I can not tell when your queue will be completed because your downloads are *paused*.'
        fn(null,msg)
      }else {

        var completionDateTime = moment().add(data.timeleft)
        var msg = 'Your queue will be completed ' + completionDateTime
      }

      return
    })
  }

}
