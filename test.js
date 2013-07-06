'use strict';
/*jslint node:true, indent:2*/
/*globals describe, it*/

var server = require('./server.js');
var assert = require('assert');

var name = '';

if (name === '') {
  throw new Error('Please enter a test server name!');
}

describe('Server', function () {
  it('List the servers', function (done) {
    server.list(function (err, servers) {
      assert.ifError(err);
      done();
    });
  });

  it('List the players', function (done) {
    server.listPlayers(name, function (err, players) {
      assert.ifError(err);
      done();
    });
  });

  it('Say "Hello; World" in game', function (done) {
    server.say(name, 'Hello; World', function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('Stop the server', function (done) {
    server.stop(name, function (err) {
      assert.ifError(err);
      done();
    }, true);
  });

  it('Start the server', function (done) {
    server.start(name, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('Restart the server', function (done) {
    server.restart(name, function (err) {
      assert.ifError(err);
      done();
    }, true);
  });
});

describe('Whitelist', function () {
  var pTest;
  it('Should list the players on the whitelist', function (done) {
    server.whiteList.list(name, function (err, players) {
      assert.ifError(err);
      pTest = players[0];
      done();
    });
  });

  it('Should remove the first player from the whitelist', function (done) {
    server.whiteList.remove(name, pTest, function (err) {
      assert.ifError(err);
      server.whiteList.list(name, function (err, players) {
        assert.ifError(err);
        if (players[0] === pTest) {
          throw new Error('Player[0] should not be on the whitelist!');
        }
        done();
      });
    });
  });

  it('Should turn the whitelist off', function (done) {
    server.whiteList.off(name, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('Should turn the whitelist on', function (done) {
    server.whiteList.on(name, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('Should add the player to the whitelist', function (done) {
    server.whiteList.add(name, pTest, function (err) {
      assert.ifError(err);
      done();
    });
  });
});
