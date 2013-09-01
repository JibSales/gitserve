// -- Load Modules
var pushover = require('pushover');
var utils = require('./utils');
var config = require('../config');

exports.api = require('./api').middleware;

exports.basicAuth = function () {
  return function (req, res, next) {
    var auth = req.headers.authorization;
    if (!auth) return utils.unauthorized(res);
    var user = utils.parseBasicAuthCredentials(auth);

    var result = profiles.filter(function (profile) {
      return profile.name == user.name && profile.password == user.password
    });
    return result.length == 0 ? utils.unauthorized(res) : next();
  }
}

exports.handler = function (options) {

  // if (options.)

  // -- Setup
  var repos = pushover(options.repos);

  repos.on('info', function (info) {
    
    console.log(info.repo);
    info.accept();
  });
  repos.on('push', function (push) {
    console.log('push');
    push.accept();
  });
  repos.on('tag', function (tag) {
    console.log('tag');
    tag.accept();
  });
  repos.on('fetch', function (fetch) {
    console.log('fetch');
    fetch.accept();
  });
  repos.on('head', function (head) {
    console.log('head');
    head.accept();
  });

  return function (req, res, next) {
    repos.handle(req, res);
  }
}