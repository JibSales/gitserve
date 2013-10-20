var express = require('express')
  , fs = require('fs')
  , utils = require('./utils');

module.exports = function (options) {
  var app = express();
  
  if ("development" === app.get('env')) {
    app.use(express.logger('dev'));  
  }

  app.set('repos', options.repos)

  // app.use(function (req, res, next) {

  //   var auth = req.headers.authorization;
  //   if (!auth) return utils.unauthorized(res);

  //   var credentials = utils.parseBasicAuthCredentials(auth);
  //   req.user = credentials.name;

  //   next();

  // });

  app.use(app.router);
  // app.use(express.static('/Users/sean/Sandbox/git/repos/JibSales/test'));

  require('./routes')(app);

  return app;
}