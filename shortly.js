var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');

//added session API here
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//define this session here.
app.use(session({
  secret: 'nyan cat',
  resave: false,
  saveUninitialized: true//,
//   cookie: { secure: true },
//   path: '/',
//   maxAge: null,
}));

app.get('/', util.checkUser,
function(req, res) {
  res.render('index');
});


app.get('/create', util.checkUser,
function(req, res) {
  res.render('index');
});

app.get('/links', util.checkUser,
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', util.checkUser,
function(req, res) {
  var uri = req.body.url;
  console.log(uri);
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // console.log('req body', req.body);

  new User({ username: username, password: password }).fetch().then(function(found) {
    if (!found) {
      // res.status(200).send(found.attributes);
      bcrypt.hash(password, null, null, function(err, hashedpassword) {
        if (err) {
          console.log(err);
        } else {
          Users.create({ username: username, password: hashedpassword }).then(function(user) {
            util.createSession(req, res, user);
          });
        }
      });
    } else {
      res.redirect('/signup');
    }
  }
);
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // console.log('req.body:', req.body);

  new User({username: username}).fetch().then(function(user) {
    if (!user) {
      res.redirect('/login');
    } else {
      bcrypt.compare(password, user.get('password'), function(err, match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
//create a session
//check each session
//redirect them
//logging in
//checking password (bcrypt.comparePassword(password, User.getPassword()));
//if there is a match allow user to log in
//if no redirect

/*    if(username == 'demo' && password == 'demo'){
        request.session.regenerate(function(){
        request.session.user = username;
        response.redirect('/restricted');
        });
    } else {
       response.redirect('login');
    }*/
});

app.get('/logout', function(request, response) {
  request.session.destroy(function() {
    response.redirect('/login');
  });
});


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
