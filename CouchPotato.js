var request = require('request')
var os = require('os')

module.exports = function(url, token) {
  return new CouchPotato(url, token)
}

function CouchPotato(url, token) {
  var self = this
  self.url = url
  self.token = token

  self.SearchMovie = function(queryString, fn) {
    var url = self.url + 'api/' + self.token + '/' + 'search?q=' + queryString
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
      if (!data.movies || data.movies.length === 0) {
        var msg = 'I could not find any movies with that name.'
        fn(null, msg)
        return
      }
      var resultCount = data.movies.length
      var foundMovies = ''
      for (var i = 0; i < data.movies.length; i++) {
        foundMovies = foundMovies + os.EOL + '•' + data.movies[i].original_title + '(' + data.movies[i].year + ')'
      }
      var msg = 'I found ' + resultCount + ' movie(s) that match your query.' + '*' + foundMovies + '*'
      fn(null, msg)
      return
    })
  }
  self.ShowLogs = function(lines, type_log, fn) {
    var url = self.url + 'api/' + self.token + '/' + 'logging.partial?'
    if (lines) {
      url = url + 'lines=' + lines
    }

    if (lines && type_log) {
      url = url + '&'
    }

    if (type_log) {
      url = url + 'type=' + type_log
    }
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
      if (!data.log || data.log.length === 0) {
        var msg = 'I could not find any logs.'
        fn(null, msg)
        return
      }
      var logLines = ''
      for (var i = 0; i < data.log.length; i++) {
        logLines = logLines + os.EOL + os.EOL + '*[' + data.log[i].time + ']-' + '[' + data.log[i].type + ']*-' + data.log[i].message
      }
      var msg = ':page_with_curl:*Logs:*' + logLines
      fn(null, msg)
      return
    })
  }
}
