#Git HTTP Server for Node.js
For now, this module remains as a manifest-file based authentication wrapper around Substack's `pushover`. However, the intended future of this module is a framework of Connect/Express compatible middleware for creating a full featured custom git server over any protocol.

###Note:
While `pushover` is a strong module on its own, I found it to be rather inflexible when trying to extend its feature set in a modern Connect/Express middleware stack:

* It demands to be the last middleware in the stack as it does not use the `next()` method. 
* It produces its own unstyled HTTP errors.
* It assumes/creates a directory structure based off the URL leaving 

When considering the "many tiny services that do one thing well" philosophy of the developer, I understand why the `pushover` module was designed as a barebones service. However, I need a git service that is a little more Connect/Express friendly.


##Getting Started
### Installation
To install the `gitserve` global binary use npm:

```
$ npm install gitserve -g
```
### Usage
```
$ gitserve start --repos [path to repos] --config [path to config]
  
gitserve listening on port 3000
    --config ./config.json
    --repos  ./

```
then

```
$ git push http://localhost:3000/<user>/<repo> master
Counting objects: 29, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (24/24), done.
Writing objects: 100% (29/29), 5.05 KiB, done.
Total 29 (delta 5), reused 0 (delta 0)
To http://localhost:3000/JibSales/gitserve
 * [new branch]      master -> master

```

### Options

```
Usage:            gitserve [options]

Commands:
  start           Starts the gitserve server

Options:
  -p, --port      Port to start the server on.                          [default: "3000"]
  -c, --config    Path to the config file.                              [default: "./config.json"]
  -r, --repos     Directory where the repos to serve are located.       [default: "./"]
  -i, --interval  Interval (seconds) in which config file is reloaded.  [default: 30]
  -h, --help      You're looking at it.                               
  -v, --version   Print the version number.       
```

##TODO
This is still very much a work in progress, but it serves my needs for now. While `pushover` is a strong module on its own, it's pretty inflexible when added to a modern Connect/Express middleware stack.   the  Desired features include:

*  Remove `pushover` dependency and port to truely compatible Connect/Express middleware.
*  Attach an optional public API for remote CRUD methods on the `config.json` file.
*  Introduce database transport layer prefably with an agnostic library like NodeJitsu's [resourceful](http://github.com/flatiron/resourceful).