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
      if(!data.movies || data.movies.length === 0)
      {
        var msg = 'I could not find any movies with that name.'
        fn(null, msg)
        return
      }
      var resultCount = data.movies.length
      var foundMovies = ''
      for (var i = 0; i < data.movies.length; i++) {
        foundMovies = foundMovies + os.EOL + data.movies[i].original_title + '(' + data.movies[i].year + ')'
      }
      var msg = 'I found ' + resultCount + ' movie(s) that match your query.' + foundMovies
      fn(null, msg)
      return
    })
  }
}
