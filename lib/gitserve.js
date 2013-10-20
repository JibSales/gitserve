var express = require('express')
  , fs = require('fs')
  , spawn = require('child_process').spawn
  , utils = require('./utils');

var middleware = {};
fs.readdirSync(__dirname + '/middleware').forEach(function (file) {
  if ('.DS_Store' !== file) {
    middleware[file.split('.')[0]] = require('./middleware/' + file);
  }
});

module.exports = function (options) {
  var app = express();
  
  if ("development" === app.get('env')) {
    app.use(express.logger('dev'));  
  }

  // app.use(function (req, res, next) {

  //   var auth = req.headers.authorization;
  //   if (!auth) return utils.unauthorized(res);

  //   var credentials = utils.parseBasicAuthCredentials(auth);
  //   req.user = credentials.name;

  //   next();

  // });

  // app.use(middleware.git({ repos: options.repos }));
  // app.use(express.bodyParser());
  // app.use(express.query());
  app.use(app.router);
  // app.use(express.static('/Users/sean/Sandbox/git/repos/JibSales/test'));

  app.get('/:user/:project/info/refs', function (req, res, next) {
    
    res.set('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.set('Content-Type', 'application/x-git-receive-pack-advertisement');

    function pack (s) {
        var n = (4 + s.length).toString(16);
        return Array(4 - n.length + 1).join('0') + n + s;
    }
    res.write(pack('# service=git-receive-pack\n'));
    res.write('0000');

    var git = spawn('/usr/bin/git-receive-pack', [
      '--stateless-rpc', 
      '--advertise-refs', 
      '/Users/sean/Sandbox/git/repos/JibSales/test'
    ]);
  
    git.stdout.pipe(res);
    git.stderr.on('data', function (data) {
      console.log("stderr: %s", data);
    });
    git.on('exit', function () {
      res.end();
    });
  });

  app.post('/:user/:project/git-receive-pack', function (req, res, next) {
    res.set('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.set('Content-Type', 'application/x-git-receive-pack-result');

    var git = spawn('/usr/bin/git-receive-pack', [
      '--stateless-rpc', 
      '/Users/sean/Sandbox/git/repos/JibSales/test'
    ]);
    req.pipe(git.stdin);
    git.stdout.pipe(res);
    git.stderr.on('data', function (data) {
      console.log("stderr: %s", data);
    });
    git.on('exit', function () {
      res.end();
    });
  });

  return app;
}