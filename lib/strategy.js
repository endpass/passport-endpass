/* eslint-disable no-param-reassign,no-underscore-dangle */
/**
 * Module dependencies.
 */
const util = require('util');
const OAuth2Strategy = require('passport-oauth2');
const { InternalOAuthError } = require('passport-oauth2');
const Profile = require('./profile');
const {
  USER_PROFILE_URL,
  AUTHORIZATION_URL,
  TOKEN_URL,
} = require('./constants');

/**
 * `Strategy` constructor.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `clientID`     your Endpass application's Client ID
 *   - `clientSecret` your Endpass application's Client Secret
 *   - `callbackURL`  URL to which Endpass will redirect the user after granting authorization
 *   - `appUrl`  URL of app
 *
 * Examples:
 *
 *     passport.use(new EndpassStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'its-a-secret-key',
 *         callbackURL: 'https://www.example.net/auth/endpass/callback',
 *         appUrl: 'http://myapp.com'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {object} options
 * @param {function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || AUTHORIZATION_URL;
  options.tokenURL = options.tokenURL || TOKEN_URL;
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {
    origin: options.appUrl,
  };

  delete options.appUrl;

  options.state = true;
  options.pkce = false;
  options.scope = ['user:email:read'];

  OAuth2Strategy.call(this, options, verify);
  this.name = options.name || 'endpass';
  this._userProfileURL = options.userProfileURL || USER_PROFILE_URL;
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, (err, body) => {
    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    let profile;

    try {
      profile = Profile.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    return done(null, profile);
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
