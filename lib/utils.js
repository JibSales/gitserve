var colors = require('colors');

/**
 *  Creates an error object with status code and optional message
 */
exports.error = function (code, msg) {
  var err = new Error(msg || http.STATUS_CODES[code]);
  err.status = code;
  return err;
}

/**
 *  Convenience method for telling client to send auth credentials
 */
exports.unauthorized = function (res) {
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="Authorization Required"'
  });
  return res.end();
}

/**
 *  Parses the Basic Auth header
 */
exports.parseBasicAuthCredentials = function (authorization) {
  var parts = authorization.split(' ');
  if (parts.length !== 2) next(error(400));

  var scheme = parts[0]
    , credentials = new Buffer(parts[1], 'base64').toString()
    , index = credentials.indexOf(':');

  if ('Basic' != scheme || index < 0) return next(error(400));

  return {
    name: credentials.slice(0, index),
    password: credentials.slice(index + 1)
  }
}

/**
 *  Convenience method to extract 'group/repo' patterns from URL
 */
exports.getRepoName = function (url) {
  return url.split('/').slice(1,3).join('/');
}

/**
 *  Respond with a 404 Not Found
 */
exports.notFound = function (res) {
  res.statusCode = 404;
  res.end('Not Found');
}

/**
 *  Generic logging of requests made to git repos
 */
exports.log = function (data) {
  var date = new Date();
  data = {
    user: data.request.user.name,
    event: data.evName == 'push' ? 'pushed to' : 'fetched from',
    repo: data.repo,
    date: [(date.getMonth() + 1), date.getDate(), date.getFullYear()].join('/')
          + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')
  }
  var template = '{date}: '.grey + '{user}'.magenta + ' {event} ' + '{repo}'.cyan;
  Object.keys(data).forEach(function (key) {
    var regex = new RegExp("\{" + key + "\}");
    template = template.replace(regex, data[key])
  });
  console.log(template);
  return;
}

/**
 *  Used to print the usage screen in CLI app
 */
exports.usage = [
  '',
  'Usage:            ' + 'gitserve [options]'.grey,
  '',
  'Commands:',
  '  start           ' + 'Starts the gitserve server'.grey
]

/**
 *  Used to print the bootscreen
 */
exports.printBootscreen = function (data) {
  var stdout = [
    '',
    'gitserve'.cyan + ' listening on port ' + data.port,
    ('    --config ' + data.config).grey,
    ('    --repos  ' + data.repos).grey,
    ''
  ]
  console.log(stdout.join('\n'));
  return;
}