var gitserve = require('../')
  , http = require('http')
  , connect = require('connect')
  , exec = require('child_process').exec
  , fs = require('fs')
  , rimraf = require('rimraf')
  , mkdirp = require('mkdirp');

describe('git client', function () {

  var reposDir = '/tmp/gitserve/repos'
    , remoteRepoDir = reposDir + '/JibSales/test'
    , localRepoDir = reposDir + '/../test'
    , port = 5000
    , remote = 'http://localhost:' + port + '/JibSales/test'
    , server;

  // -- Mock up an environment
  before(function (done) {

    // -- Create folder structure
    mkdirp.sync(remoteRepoDir);
    fs.mkdirSync(localRepoDir);

    // -- Initialize remote repo
    process.chdir(remoteRepoDir);
    exec('git init --bare', function (err) {
      if (err) return done(err);
      // -- Initialize local repo
      process.chdir(localRepoDir); 
      exec('git init', function (err) {
        if (err) return done(err);
        // -- Add remote
        exec('git remote add origin ' + remote, function (err) {
          if (err) return done(err);
          // -- Create first commit
          exec('touch README && git add . && git commit -m "add"', function (err) {
            if (err) return done(err);
            
            var app = connect()
              .use(gitserve({ repos: reposDir }));
            server = http.createServer(app).listen(port, done)
          });
        });
      });
    });
  });


  describe('when pushing to an untracked repository for the first time', function () {

    it('should set up to track remote branch', function (done) {

      exec('git push -u origin master', function (err, stdout, stderr) {
        if (err) return done(err);
        stderr.match(/new\sbranch/)[0].should.eql('new branch');
        stdout.should.eql('Branch master set up to track remote branch master from origin.\n');
        done();
      });
      
    });

  });

  describe('when cloning a remote repo', function () {

    it('should not cause an error', function (done) {
      process.chdir(localRepoDir + '/../')
      exec('git clone ' + remote + ' clone', function (err, stdout, stderr) {
        if (err) return done(err);
        stderr.should.be.empty;
        done();
      });
    });

  });

  describe('when pushing to a remote repo', function () {

    it('should not cause an error', function (done) {
      process.chdir(localRepoDir + '/../clone');
      exec('rm README && git add -A && git commit -m "del" && git push', function (err, stdout, stderr) {
        if (err) return done(err);
        stdout.match(/delete\smode\s100644\sREADME/)[0].should.eql('delete mode 100644 README');
        done();
      });
    });

  });

  describe('when fetching from a remote repo', function () {

    it('should not cause an error', function (done) {
      process.chdir(localRepoDir);
      exec('git fetch', function (err, stdout, stderr) {
        if (err) return done(err);
        stdout.should.be.empty;
        done();
      });
    });

  });

  describe('when pulling from a remote repo', function () {

    it('should not cause an error', function (done) {
      process.chdir(localRepoDir);
      exec('git pull', function (err, stdout, stderr) {
        if (err) return done(err);
        stdout.match(/delete\smode\s100644\sREADME/)[0].should.eql('delete mode 100644 README');
        stderr.should.be.empty;
        done();
      });
    });

  });

  after(function (done) {
    server.close();
    rimraf('/tmp/gitserve', done);
  });

});