var path = require('path');
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../db/shortly.sqlite')
  },
  useNullAsDefault: true
});
var db = require('bookshelf')(knex);

db.knex.schema.hasTable('urls').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('urls', function (link) {
      link.increments('id').primary();
      link.string('url', 255);
      link.string('baseUrl', 255);
      link.integer('userId');
      link.string('code', 100);
      link.string('title', 255);
      link.integer('visits');
      link.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

db.knex.schema.hasTable('clicks').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('clicks', function (click) {
      click.increments('id').primary();
      click.integer('linkId');
      click.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

/************************************************************/
// Add additional schema definitions below
/************************************************************/

db.knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('users', function (user) {
      user.increments('id').primary();
      user.string('created_at');
      user.string('password');
      user.string('updated_at');
      user.string('username');
      user.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

// db.knex.schema.hasTable('urlsUsers').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urlsUsers', function (urlUser) {
//       urlUser.increments('id').primary();
//       urlUser.integer('urlId');
//       urlUser.integer('userId');
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

db.knex.from('users').innerJoin('urls', 'users.Id', 'urls.userId');
// innerJoin — .innerJoin(column, ~mixed~)
// knex.from('users').innerJoin('accounts', 'users.id', 'accounts.user_id')
// Outputs:
// select * from `users` inner join `accounts` on `users`.`id` = `accounts`.`user_id`


module.exports = db;
