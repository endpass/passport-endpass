var express = require('express');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
// var EndpassStrategy = require('passport-endpass').Strategy;
var EndpassStrategy = require('../../lib/strategy');
var partials = require('express-partials');

var ENDPASS_CLIENT_ID = 'client-id';
var ENDPASS_CLIENT_SECRET_ID = 'client-secret';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Endpass profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the EndpassStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and
//   Endpass profile), and invoke a callback with a user object.
passport.use(
  new EndpassStrategy(
    {
      clientID: ENDPASS_CLIENT_ID,
      clientSecret: ENDPASS_CLIENT_SECRET_ID,
      callbackURL: 'http://localhost:8080/auth/endp/callback',
      appUrl: 'http://localhost',
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      process.nextTick(function() {
        // To keep the example simple, the user's Endpass profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Endpass account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    },
  ),
);

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(
  session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }),
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res) {
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res) {
  res.render('login', { user: req.user });
});

// GET /auth/endp
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Endpass authentication will involve redirecting
//   the user to auth.endpass.com.  After authorization, Endpass will redirect the user
//   back to this application at /auth/endp/callback
app.get('/auth/endp', passport.authenticate('endpass'), function(req, res) {
  // The request will be redirected to Endpass for authentication, so this
  // function will not be called.
});

// GET /auth/endp/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
  '/auth/endp/callback',
  passport.authenticate('endpass', {
    failureRedirect: '/login',
  }),
  function(req, res) {
    res.redirect('/');
  },
);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(8080);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
