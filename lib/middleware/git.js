// -- Load Modules
var pushover = require('pushover');

// -- Set the directory for the repo
var repos = pushover('/tmp/repos');

repos.list(function (err, repos) {
  console.log(repos);
});

repos.on('push', function (push) {
  console.log('push ' + push.repo + '/' + push.commit
    + ' (' + push.branch + ')'
  );
  push.accept();
});

repos.on('fetch', function (fetch) {
  console.log('fetch ' + fetch.repo + '/' + fetch.commit);
  fetch.accept();
});

// -- Expose middleware
module.exports = function (req, res, next) {
  repos.handle(req, res);
}