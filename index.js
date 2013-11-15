// -- Load Modules
var spawn = require('child_process').spawn;
var url = require('url');
var path = require('path');
var fs = require('fs');


module.exports = function (options) {
  var router = {
    "GET" : /\/(.+)\/info\/refs\?service\=git-(receive|upload)-pack/,
    "POST" : /\/(.+)\/git-(receive|upload)-pack/
  }
  
  options = options || {};
  if (!options.repos) throw new Error('You must include a valid directory as the "repos" option.');
  if (!fs.existsSync(options.repos)) throw new Error('Repos directory doesn\'t exist.');

  function setupGitService (req) {

    // -- Get the route and service
    var match = req.url.match(router[req.method]);
    
    // -- Create object
    var git = {
      repo: path.join(options.repos, match[1]),
      service: 'git-' + match[2] + '-pack'
    }

    // -- Return git object
    return git;
  }

  // -- Taken from https://github.com/substack/pushover
  function pack (s) {
    var n = (4 + s.length).toString(16);
    return Array(4 - n.length + 1).join('0') + n + s;
  }

  function spawnGitService (req) {

    // -- Put together options to pass to git service
    var args = [];
    args.push('--stateless-rpc');
    if ('GET' === req.method) args.push('--advertise-refs');
    args.push(req.git.repo);
    
    // -- Spawn the service and end the response on exit
    return spawn('/usr/bin/' + req.git.service, args);
  
  }

  return function (req, res, next) {

    // -- Filter out anything that is not a valid method or route
    if ('GET' !== req.method && 'POST' !== req.method) return next();
    if (!router[req.method].test(req.url)) return next();
    
    // -- Setup Git Service
    req.git = setupGitService(req);

    // -- Set headers
    res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.setHeader('Content-Type', 'application/x-' + req.git.service + '-advertisement');

    // -- Write response body for GET /:namespace/info/refs
    if ('GET' === req.method) {
      res.write(pack('# service=' + req.git.service + '\n'));
      res.write('0000');
    }

    // -- Spawn git service
    var service = spawnGitService(req);
    req.pipe(service.stdin);
    service.stdout.pipe(res);
    service.on('error', function (data) {
      res.statusCode(500);
      res.write('Internal Server Error');
    });
    service.on('exit', function () {
      res.end();
    });

  }
}