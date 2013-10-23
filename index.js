var spawn = require('child_process').spawn
  , url = require('url')
  , qs = require('querystring')
  , path = require('path')
  , fs = require('fs');


module.exports = function (options) {
  var router = {
    "GET" : /\/(.+)\/info\/refs\?service\=git-(receive|upload)-pack/,
    "POST" : /\/(.+)\/git-(receive|upload)-pack/
  }
  
  options = options || {};
  if (!options.repos) throw new Error('You must include a valid directory as the "repos" option.');
  if (!fs.existsSync(options.repos)) throw new Error('Repos directory doesn\'t exist.');

  // -- Taken from https://github.com/substack/pushover
  function pack (s) {
    var n = (4 + s.length).toString(16);
    return Array(4 - n.length + 1).join('0') + n + s;
  }

  function spawnGitService (req, res) {

    // -- Put together options to pass to git service
    var args = [];
    args.push('--stateless-rpc');
    if ('GET' === req.method) args.push('--advertise-refs');
    args.push(req.repo);
    
    // -- Spawn the service and end the response on exit
    return spawn('/usr/bin/' + req.service, args);
  
  }

  function notFound (req, res) {
    if (req.app) return next();
    else {
      res.statusCode = 404;
      return res.end();
    }
  }

  return function (req, res, next) {

    // -- Filter out anything that is not a part of the router
    if (!router[req.method].test(req.url)) return notFound(req, res);
    
    // -- Request setup
    req.path = url.parse(req.url);
    req.query = qs.parse(req.path.query);
    req.params = req.url.match(router[req.method]);
    req.repo = path.join(options.repos, req.params[1]);
    req.service = req.query.service || 'git-' + req.params[2] + '-pack';

    // -- Set headers
    res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.setHeader('Content-Type', 'application/x-' + req.service + '-advertisement');

    // -- Setup body of response to GET /:namespace/info/refs
    if ('GET' === req.method) {
      res.write(pack('# service=' + req.service + '\n'));
      res.write('0000');
    }

    // -- Spawn git service
    var git = spawnGitService(req, res);
    req.pipe(git.stdin);
    git.stdout.pipe(res);
    git.on('exit', function () {
      res.end();
    });

  }
}