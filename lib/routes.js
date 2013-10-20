var spawn = require('child_process').spawn
  , path = require('path');

module.exports = function (app) {

  app.get('/:user/:project/info/refs', function (req, res, next) {
    
    var service = req.query.service;

    res.set('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.set('Content-Type', 'application/x-' + service + '-advertisement');

    function pack (s) {
        var n = (4 + s.length).toString(16);
        return Array(4 - n.length + 1).join('0') + n + s;
    }
    res.write(pack('# service=' + service + '\n'));
    res.write('0000');
    
    var git = spawn('/usr/bin/' + service, [
      '--stateless-rpc', 
      '--advertise-refs',
      path.join(req.app.get('repos'), req.params.user, req.params.project)
    ]);
  
    git.stdout.pipe(res);
    git.stderr.on('data', function (data) {
      console.log("stderr: %s", data);
    });
    git.on('exit', function () {
      res.end();
    });

  });

  app.post('/:user/:project/:service', function (req, res, next) {
    
    var service = req.params.service;

    res.set('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.set('Content-Type', 'application/x-' + service + '-result');

    var git = spawn('/usr/bin/' + service, [
      '--stateless-rpc', 
      path.join(req.app.get('repos'), req.params.user, req.params.project)
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

}