var request = require('request')
var os = require('os')
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
      json: true,
      rejectUnauthorized: false
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
      var msg = 'You have currently *' + data.jobs.length + '* download(s) in your queue with a total filesize of *' + Math.round(data.mbleft) + '* currently download at *' + data.kbpersec + ' kb/s*'
      fn(null, msg)
      for (var i = 0; i < data.jobs.length; i++) {
        var msg = '•' +  data.jobs[i].filename + ' *' + Math.round(data.jobs[i].mbleft) + '/' + Math.round(data.jobs[i].mb) + '*'
        fn(null,msg)
      }
      if (data.paused === true) {
        var msg = 'I can not tell when your queue will be completed because your downloads are *paused*.'
        fn(null,msg)
      }else {

        var completionDateTime = moment().add(data.timeleft)
        var msg = 'Your queue will be completed ' + completionDateTime
        console.log(msg)
      }

      return
    })
  }

}
