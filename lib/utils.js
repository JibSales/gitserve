exports.error = function (code, msg) {
  var err = new Error(msg || http.STATUS_CODES[code]);
  err.status = code;
  return err;
}

exports.unauthorized = function (res) {
  res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
  return res.send(401);
}

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

exports.notFound = function (req, res, next) {
  res.status(404);
  
  return res.render(view + 'error', { status: res.statusCode, message: 'Not Found' });
}