var spawn = require('child_process').spawn
  , url = require('url')
  , qs = require('querystring')
  , path = require('path');


module.exports = function (options) {
  var routeRegExp = /\/(.+)\/(info\/refs|git-(receive|upload)-pack)/;
  
  // -- Taken from http://github.com/substack/pushover
  function pack (s) {
    var n = (4 + s.length).toString(16);
    return Array(4 - n.length + 1).join('0') + n + s;
  }

  function spawnGitService (req, res) {

    // -- Put together options to pass to git service
    var args = [];
    args.push('--stateless-rpc');
    if ('GET' === req.method) args.push('--advertise-refs');
    args.push(path.join(options.repos, req.project));
    
    // -- Spawn the service and end the response on exit
    var service = spawn('/usr/bin/' + req.service, args);
    service.on('exit', function () {
      res.end();
    });

    return service;
  }

  return function (req, res, next) {

    // -- Pass on none git requests
    if ('GET' !== req.method && 'POST' !== req.method) return next();
    if (!routeRegExp.test(req.url)) return next();
    
    // -- Request setup
    req.path = url.parse(req.url);
    req.query = qs.parse(req.path.query);
    req.params = req.url.match(routeRegExp);
    req.project = req.params[1];
    req.service = req.query.service || req.params[2];
    
    // -- Set headers
    res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.setHeader('Content-Type', 'application/x-' + req.service + '-advertisement');

    // -- Respond to GET /:user/:project/info/refs
    if ('GET' === req.method) {
      res.write(pack('# service=' + req.service + '\n'));
      res.write('0000');
    }

    // -- Spawn git service
    var git = spawnGitService(req, res);
    req.pipe(git.stdin);
    git.stdout.pipe(res);

  }
}