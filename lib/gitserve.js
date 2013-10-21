var express = require('express')
  , spawn = require('child_process').spawn
  , fs = require('fs')
  , path = require('path');

var router = new express.Router();

function setHeaders (req, res) {
  res.set({
    'Expires': 'Fri, 01 Jan 1980 00:00:00 GMT',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache, max-age=0, must-revalidate',
    'Content-Type': 'application/x-{service}-result'.replace('{service}', req.service)
  });
}

function spawnService (req, res) {

  var options = [];
  options.push('--stateless-rpc');
  if ('GET' === req.method) options.push('--advertise-refs');
  options.push(path.join(req.app.get('repos'), req.user, req.project));
  
  var service = spawn('/usr/bin/' + req.service, options);

  service.stderr.on('data', function (data) {
    console.log("stderr: %s", data);
  });

  service.on('exit', function () {
    res.end();
  });

  return service;
}

router.param('user', function (req, res, next, user) {
  fs.exists(path.join(req.app.get('repos'), user), function (exists) {
    if (!exists) return res.send(404);
    req.user = user;
    next();
  });
});

router.param('project', function (req, res, next, project) {
  fs.exists(path.join(req.app.get('repos'), req.user, project), function (exists) {
    if (!exists) return res.send(404);
    req.project = project;
    next();
  });
});

router.get('/:user/:project/info/refs', function (req, res, next) {

  req.service = req.query.service;
  
  // -- pack() taken from http://github.com/substack/pushover
  function pack (s) {
      var n = (4 + s.length).toString(16);
      return Array(4 - n.length + 1).join('0') + n + s;
  }
  res.write(pack('# service=' + req.service + '\n'));
  res.write('0000');

  var service = spawnService(req, res);
  service.stdout.pipe(res);

});


router.post('/:user/:project/git-(receive|upload)-pack', function (req, res, next) {

  req.service = 'git-' + req.params[0] + '-pack';

  var service = spawnService(req, res);
  req.pipe(service.stdin);
  service.stdout.pipe(res);

});

module.exports = router;