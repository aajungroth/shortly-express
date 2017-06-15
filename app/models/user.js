var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  hashPassword: function() {

  },

    // var cypher = Promise.promisify(bcrypt.hash);
    // return cypher(this.get('password'), null, null).bind(this).then(function(hash) {
    //   this.set('password', hash);
    // });
  // },
  // comparePassword: function() {
  //   var cypher = Promise.promisify(bcrypt.compare);
  //   return cypher("password", hash, function(err, res) {
  //     // res == true
  //     if (err) {
  //       console.log(err);
  //     } else {

  //     }
  //   });
  // },
  // initialize: function() {
  //   this.on('creating', this.hashPassword);
  // },
  user: function() {
    return this.belongsTo(User, 'userId');
  }
});

module.exports = User;