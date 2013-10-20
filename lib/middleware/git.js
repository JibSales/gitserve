// -- Load Modules
var pushover = require('pushover')
  , utils = require('../utils');

module.exports = function (options) {
  var repos = pushover(options.repos);

  // -- Check write permission and log push request
  repos.on('push', function (push) {
    // if (~push.request.permissions.indexOf('W')) {
      utils.log(push);
      return push.accept();
    // }
    // push.reject();
  });

  // -- Check write permission and log push --tags request
  repos.on('tag', function (tag) {
    // if (~tag.request.permissions.indexOf('W')) {
      utils.log(tag);
      return tag.accept();
    // }
    // tag.reject();
  });

  // -- Check read persmissions and log fetch request
  repos.on('fetch', function (fetch) {
    // if (~fetch.request.permissions.indexOf('R')) {
      utils.log(fetch);
      return fetch.accept();
    // }
    // fetch.reject();
  });

  return function (req, res) {
    repos.handle(req, res);
  }
}