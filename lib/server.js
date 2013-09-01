// -- Load modules
var express = require('express');
var http = require('http');
var gitserve = require('./gitserve');

var config = require('../config');

// -- Setup
var app = express();

// -- Middleware
app.use(express.logger('dev'));
app.use(gitserve.basicAuth(config.users));

app.use(gitserve.handler({
  repos: '/Users/sean/Desktop/repos'
}));
app.use('/api', gitserve.api);
// app.use(utils.notFound());
app.use(express.errorHandler());

// -- Simple server
http.createServer(app).listen(process.argv[2] || 3000, function (){
  console.log('gitserve started')
});