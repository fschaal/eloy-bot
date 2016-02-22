module.exports = function () {
  return new UserHelper()
}

function UserHelper() {
  var self = this

  self.getUserAge = function(dateString,fn) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return fn(age);
  }
}
