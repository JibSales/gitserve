// -- Load Modules
var pushover = require('pushover');
var fs = require('fs');
var colors = require('colors');
var utils = require('./utils');

module.exports = function (options) {
  var repos = pushover(options.repos);

  // -- Check write permission and log push request
  repos.on('push', function (push) {
    if (~push.request.permissions.indexOf('W')) {
      utils.log(push);
      return push.accept();
    }
    push.reject();
  });

  // -- Check write permission and log push --tags request
  repos.on('tag', function (tag) {
    if (~tag.request.permissions.indexOf('W')) {
      utils.log(tag);
      return tag.accept();
    }
    tag.reject();
  });

  // -- Check read persmissions and log fetch request
  repos.on('fetch', function (fetch) {
    if (~fetch.request.permissions.indexOf('R')) {
      utils.log(fetch);
      return fetch.accept();
    }
    fetch.reject();
  });

  // -- Reload the config file at specified interval
  var config = JSON.parse(fs.readFileSync(options.config));
  setInterval(function () {
    config = JSON.parse(fs.readFileSync(options.config));
  }, options.interval * 1000);

  // -- Return HTTP compatible function
  return function (req, res) {

    // -- Send 401 if no auth header
    var auth = req.headers.authorization;
    if (!auth) return utils.unauthorized(res);
    
    // -- Parse Basic Auth credentials
    var credentials = utils.parseBasicAuthCredentials(auth);

    // -- Load config
    req.config = config;

    // -- Lookup user in config file
    req.user = req.config.users.filter(function (user) {
      return user.name == credentials.name && user.password == credentials.password;
    }).pop();
  
    // -- Send 401 if user doesn't exist
    if (!req.user) return utils.unauthorized(res);


    // -- TODO: Add API routes here


    // -- Send 404 for all requests that are not valid repos
    var repo = req.config.repos.filter(function (repo) {
      return repo.name === utils.getRepoName(req.url);
    }).pop();
    if (!repo) return utils.notFound(res);

    // -- Set user's permissions on request
    req.permissions = repo.members.filter(function (member) {
      return member.name === req.user.name;
    }).pop().permissions;

    // -- Handle git requests
    repos.handle(req, res);
  }
}