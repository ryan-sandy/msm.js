'use strict';
/*jslint node:true, indent:2*/

var exec = require('child_process').exec;

var clean = function (message) {
  var rtn = message.slice(0);
  rtn = rtn.replace(';', '\\;');
  return rtn;
};

exports.listPlayers = function (serverName, next) {
  exec(
    'msm ' + clean(serverName) + ' connected',
    function (err, stdout, stderr) {
      if (err) { return next(err); }
      next(null, stdout.trim().split('\n'));
    }
  );
};

exports.kick = function (serverName, playerName, next) {
  exec(
    'msm ' + clean(serverName) + ' kick ' + clean(playerName),
    function (err, stdout, stderr) {
      if (err) { return next(err); }
      next();
    }
  );
};

exports.say = function (serverName, message, next) {
  exec(
    'msm ' + clean(serverName) + ' say ' + clean(message),
    function (err, stdout, stderr) {
      if (err) { return next(err); }
      next();
    }
  );
};

exports.whiteList = {
  'on' : function (serverName, next) {
    exec('msm ' + clean(serverName) + ' wl on', function (err, stdout) {
      if (err) { return next(err); }
      next();
    });
  },
  'off' : function (serverName, next) {
    exec('msm ' + clean(serverName) + ' wl off', function (err, stdout) {
      if (err) { return next(err); }
      next();
    });
  },
  'add' : function (serverName, playerName, next) {
    exec(
      'msm ' + clean(serverName) + ' wl add ' + clean(playerName),
      function (err, stdout) {
        if (err) { return next(err); }
        next();
      }
    );
  },
  'remove' : function (serverName, playerName, next) {
    exec(
      'msm ' + clean(serverName) + ' wl remove ' + clean(playerName),
      function (err, stdout) {
        if (err) { return next(err); }
        next();
      }
    );
  }
};

//Lists the servers
exports.list = function (next) {
  var child = exec('msm server list', function (err, stdout, stderr) {
    if (err) {
      return next(err);
    }
    var servers = [];
    stdout.trim().split('\n').forEach(function (ser) {
      var pos = ser.search('\"'), end = ser.lastIndexOf('\"');
      if (pos >= 0) {
        servers.push({
          'name' : ser.slice(pos + 1, end),
          'status' : ser.slice(1, ser.search("]")).trim(),
          'message' : ser.slice(ser.indexOf('.') + 2)
        });
      }
    });
    next(null, servers);
  });
};
