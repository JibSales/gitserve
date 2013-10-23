#Gitserve
A nodejs port of `git http-backend` for serving git repos with the Smart HTTP/HTTPS Protocol. Can be used as a stand alone HTTP handler or as a Connect/Express middleware. Responds to fetch, clone, push and pull.

##Getting Started
`gitserve` takes an options hash and exposes a Connect/Express compatible middleware or HTTP handler. The only required option is the directory in which the bare repositories are located.

#####Install
```
$ npm install gitserve
```

#####Connect/Express Middleware
```
var connect = require('connect')
  , gitserve = require('gitserve');

var app = connect()
  .use(gitserve({ repos: '/path/to/repos' }));
app.listen(3000);
```

#####HTTP Handler
```
var http = require('http')
  , gitserve = require('gitserve');

var handler = gitserve({ repos: '/path/to/repos'});
http.createServer(handler).listen(3000);
```

#####Repo namespacing
`gitserve` allows for a leading wildcard path to namespace your repos. For instance, to mimic Github's `user/project` namespacing you would add a remote

```
$ git remote add origin http://localhost:3000/JibSales/myAwesomeProject
```
and `gitserve` will look in `/path/to/repos/JibSales/myAwesomeProject` for a valid git repository. The namespacing can go as deep as your heart desires.

##But what about feature x, y or z?
`gitserve` is meant to be super light weight, unopinionated and only respond to requests that match the git Smart HTTP Protocol. Authentication, autocreation, hooks -- these all require strong opinions and depend on the business logic of the application layer.

####To Do List:
  * Tests

####Special Thanks
Big ups to James Halliday aka, substack as his `pushover` module was intergal to understanding how to write `info/refs` responses.

####LICENSE
MIT