// -- Load Modules
var express = require('express');
var pushover = require('pushover');

// -- Create `app` object
var app = express();

// -- Set defaults
app.set('version', require('../package.json').version);
app.set('repos', '/tmp/repos');

// -- Load Config file
var config = require('../config.json');
Object.keys(config).forEach(function (key) {
  app.set(key, config[key]);
});

// -- Default middleware
app.use(express.logger('dev'));
app.use(express.errorHandler());

app.repos = pushover(app.get('repos'));

app.use(express.basicAuth('JibSales', 'fuck'));
app.use(function (req, res) {
  app.repos.handle(req, res);
});

// -- Export `app` object
module.exports = app;