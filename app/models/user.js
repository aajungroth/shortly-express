var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User, 'userId');
  }
});

module.exports = User;