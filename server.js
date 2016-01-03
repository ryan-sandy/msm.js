'use strict';
/*jslint node:true, indent:2*/

var exec = require('child_process').exec;
import _ from 'lodash';

var validName = /^[a-zA-Z0-9\_\-]+$/;
var invalidName = /^(start|stop|restart|version|server|jargroup|all|config|update|help|\-\-.*)$/;
var msgReservedName = 'A name may not be any of the following reserved worlds "start", "stop", "restart", "server", "version", "jargroup", "all", "config", "update" or "help" or start with two dashes (--)';
var errorCodes = {
  64: "Invalid user system user.",
  65: "Invalid command.",
  66: "Invalid argument(s).",
  67: "Server is stoped.",
  68: "Server is running.",
  69: "Name not found.",
  70: "File not found,",
  71: "Duplicate name.",
  72: "Failed to roll log files.",
  73: "Conf error.",
  74: "FATAL ERROR!",
  75: "Java not installed."
};

var mcServerProps = {
  "allow-flight": false,
  "allow-nether": true,
  "announce-player-achievements": true,
  "difficulty": 1,
  "enable-query": false,
  "enable-rcon": false,
  "enable-command-block": false,
  "force-gamemode": false,
  "gamemode": 0,
  "generate-structures": true,
  "generator-settings": "",
  "hardcore": false,
  "level-name": "world",
  "level-seed": "",
  "level-type": "DEFAULT",
  "max-build-height": 256,
  "max-players": 20,
  "max-tick-time": 60000,
  "max-world-size": 29999984,
  "motd": "A Minecraft Server",
  "network-compression-threshold": 256,
  "online-mode": true,
  "op-permission-level": 4,
  "player-idle-timeout": 0,
  "pvp": true,
  "query.port": 25565,
  "rcon.password": "",
  "rcon.port": 25575,
  "resource-pack": "",
  "resource-pack-hash": "",
  "server-ip": "",
  "server-port": 25565,
  "snooper-enabled": true,
  "spawn-animals": true,
  "spawn-monsters": true,
  "spawn-npcs": true,
  "spawn-protection": 16,
  "use-native-transport": true,
  "view-distance": 10,
  "white-list": false,
  "verify-names": true,
  "admin-slot": false,
  "public": true,
  "server-name": "A Minecraft Server",
  "max-connections": 3,
  "grow-trees": true
};

var clean = function (message) {
  var rtn = message.slice(0);
  rtn = rtn.replace(';', '\\;');
  return rtn;
};

// todo how do we handle players with invalid names? Does it matter?
var isValidName = function (name) {
  return (!name.match(invalidName) && name.match(validName));
};

var formatServerList = function (serverList) {
  var servers = [];
  serverList.trim().split('\n').forEach(function (ser) {
    var tmp = ser
      .replace('[ ACTIVE ]', 'ACTIVE')
      .replace('[INACTIVE]', 'INACTIVE')
      .split(' ');
    servers.push({
      'name': tmp[1].slice(1, tmp[1].length - 1),
      'state': tmp[3].slice(0, tmp[3].length - 1),
      'status': tmp[0],
      'message': ser.slice(ser.indexOf('.') + 2)
    });
  });
  return servers;
};

var formatPropertiesFile = function (configString) {
  var config = {};
  configString.split('\n').forEach(function (ele) {
    var split = ele.split('=');
    if (!split[0].startsWith('#') && split[0] !== '') {
      if (split[1]) {
        config[split[0]] = split[1].replace(/"/g, '');
      } else {
        config[split[0]] = "";
      }
    }
  });
  return config;
};

var cat = function (filePath, formatter) {
  filePath = clean(filePath);
  return new Promise(
    function (resolve, reject) {
      exec('cat ' + filePath, function (err, stdout, stderr) {
        if (err) {
          reject({error: err, msg: stderr});
        }
        if (_.isFunction(formatter)) {
          resolve(formatter(stdout));
        } else {
          resolve(stdout);
        }
      })
    }
  );
};
var createEula = function (filePath, booleanEula) {
  filePath = clean(filePath);
  return new Promise(
    function (resolve, reject) {
      exec("echo 'eula=" + booleanEula + "' > " + filePath + 'eula.txt', function (err, stdout, stderr) {
        if (err) {
          reject({error: err, msg: stderr});
        }
        resolve(stdout);
      })
    }
  );
};

var _msmExec = function (cmd, formatter) {
  return new Promise(
    function (resolve, reject) {
      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          reject({error: err, msg: stderr});
        }
        if (_.isFunction(formatter)) {
          resolve(formatter(stdout));
        } else {
          resolve(stdout);
        }
      })
    }
  );
};

var msmExec = function (cmd, formatter, echo) {
  if (echo !== undefined) {
    cmd = clean(cmd);
    echo = clean(echo);
    cmd = 'echo ' + echo + ' | ' + cmd;
    return _msmExec(cmd, formatter);
  }
  cmd = clean(cmd);
  return _msmExec(cmd, formatter);
};


var rejectRequest = function (reason) {
  return new Promise(
    function (resolve, reject) {
      reject(reason);
    }
  )
};

exports.jarGroup = function (name) {
  return {
    list: function () {
      return msmExec('msm jargroup list');
    },
    create: function (url) {
      return msmExec('msm jargroup create ' + name + ' ' + url);
    },
    delete: function () {
      return msmExec('msm jargroup delete ' + name);
    },
    rename: function (newname) {
      return msmExec('msm jargroup rename ' + name + ' ' + newname);
    },
    changeurl: function (url) {
      return msmExec('msm jargroup changeurl ' + name + ' ' + url);
    },
    getlatest: function () {
      return msmExec('msm jargroup getlatest ' + name);
    }
  }; // end jarGroup return
}; // end jarGroup function

exports.global = {
  start: function () {
    return msmExec('msm start');
  },
  stop: function (now = false) {
    if (now) {
      return msmExec('msm stop now');
    }
    return msmExec('msm stop');
  },
  restart: function (now = false) {
    if (now) {
      return msmExec('msm restart now');
    }
    return msmExec('msm restart now');
  },
  version: function () {
    return msmExec('msm  version');
  },
  config: function () {
    return msmExec('msm  config');
  },
  // todo figure out what the deal with: "msm update --noinput" is?
  // todo we should likely not run this command as it could very easily break our wrapper
  update: function () {
    return msmExec('msm  update');
  },
  listServers: function () {
    return msmExec('msm  server list', formatServerList);
  }
}; // end global object

exports.server = function (name) {
  if (!isValidName(name)) {
    return rejectRequest(msgReservedName)
  }
  var self = this;
  return {
    create: function () {
      return msmExec('msm server create ' + name);
    },
    delete: function () {
      return msmExec('msm server delete ' + name, undefined, 'y');
    },
    rename: function (newName) {
      return msmExec('msm server rename ' + name + ' ' + newName);
    },
    start: function () {
      return msmExec('msm ' + name + ' start');
    },
    stop: function (now = false) {
      if (now) {
        return msmExec('msm ' + name + ' stop now');
      }
      return msmExec('msm ' + name + ' stop');
    },
    restart: function (now = false) {
      return msmExec('msm ' + name + ' restart' + ((now) ? ' now' : ''));
    },
    status: function () {
      return msmExec('msm ' + name + ' status');
    },
    connected: function () {
      return msmExec('msm ' + name + ' connected');
    },
    logroll: function () {
      return msmExec('msm ' + name + ' logroll');
    },
    backup: function () {
      return msmExec('msm ' + name + ' backup');
    },
    jar: function (jargroup, file) {
      return msmExec('msm ' + name + ' jar ' + jargroup + ' ' + file);
    },
    banIp: function (ip) {
      return msmExec('msm ' + name + ' bl ip add ' + ip);
    },
    unbanIp: function (ip) {
      return msmExec('msm ' + name + ' bl ip remove ' + ip);
    },
    listBanned: function () {
      return msmExec('msm ' + name + ' bl list');
    },
    listOperators: function () {
      return msmExec('msm ' + name + ' op list');
    },
    sendCmd: function (cmd) {
      return msmExec('msm ' + name + ' cmd ' + cmd);
    },
    /* disabled as this as msm requires a ctrl-c to be send to exit this cmd
     sendCmdReturnLog: function (cmd) {
     return msmExec('msm ' + name + ' cmdlog ' + cmd);
     },*/
    getPath: function () {
      return new Promise(
        function (resolve, reject) {
          self.server(name).config.getMsmKeyValue("msm-world-storage-path")
            .then(function (worldPath) {
              var path = worldPath.slice(0, worldPath.lastIndexOf('/') + 1);
              resolve(path);
            }) // end .then
            .catch(reject);
        } // end function
      ); // end Promise
    },
    config: {
      getProperties: function () {
        return new Promise(
          function (resolve, reject) {
            self.server(name).config.getMsm()
              .then((msmProps) => {
                self.server(name).config.getMc()
                  .then((mcProps) => {
                    resolve(_.merge(msmProps, mcProps));
                  })
                  .catch(reject);
              })
              .catch(reject);
          });
      },
      getMsm: function () {
        return msmExec('msm ' + name + ' config', formatPropertiesFile);
      },
      getMsmKeyValue: function (key) {
        return msmExec('msm ' + name + ' config ' + key);
      },
      setMsm: function (key, value) {
        return msmExec('msm ' + name + ' config ' + key + ' ' + value);
      },
      // todo split this into smaller more readable functions
      getMc: function () {
        return new Promise(
          function (resolve, reject) {
            self.server(name).getPath()
              .then(function (path) {
                var propFile = path + 'server.properties';
                cat(propFile, formatPropertiesFile)
                  .then(function (results) {
                    for (var key in mcServerProps) {
                      if (!results.hasOwnProperty(key)) {
                        results[key] = mcServerProps[key];
                      } // end if
                    } // end for
                    resolve(results);
                  }) // end .then
                  .catch(reject);
              }); // end .then
          } // end function
        ); // end Promise
      }, // end getMc
      setEula: function (booleanEula = true) {
        return new Promise(
          function (resolve, reject) {
            self.server(name).getPath()
              .then(function (path) {
                createEula(path, booleanEula)
                  .then(resolve)
                  .catch(reject);
              }) // end then
              .catch(reject);
            // end getPath
          }); // end promise
      }, // end setEula
    }, // end config
    worlds: {
      list: function () {
        return msmExec('msm ' + name + ' worlds list');
      },
      load: function () {
        return msmExec('msm ' + name + ' worlds load');
      },
      ram: function (world) {
        return msmExec('msm ' + name + ' worlds ram ' + world);
      },
      todisk: function () {
        return msmExec('msm ' + name + ' worlds todisk');
      },
      backup: function () {
        return msmExec('msm ' + name + ' worlds backup');
      },
      on: function (world) {
        return msmExec('msm ' + name + ' worlds on ' + world);
      },
      off: function (world) {
        return msmExec('msm ' + name + ' worlds off ' + world);
      }
    }, // end worlds
    whiteList: {
      on: function () {
        return msmExec('msm ' + name + ' wl on');
      },
      off: function () {
        return msmExec('msm ' + name + ' wl off');
      }
    }, // end whiteList
    save: {
      on: function () {
        return msmExec('msm ' + name + ' save on');
      },
      off: function () {
        return msmExec('msm ' + name + ' save off');
      },
      now: function () {
        return msmExec('msm ' + name + ' save all');
      }
    }, // end save
    player: function (player) {
      return {
        setGameMode: {
          survival: function () {
            return msmExec('msm ' + name + ' gm survival ' + player);
          },
          creative: function () {
            return msmExec('msm ' + name + ' gm creative ' + player);
          },
          adventure: function () {
            return msmExec('msm ' + name + ' gm adventure ' + player);
          },
          spectator: function () {
            return msmExec('msm ' + name + ' gm spectator ' + player);
          }
        },
        ban: function () {
          return msmExec('msm ' + name + ' bl add ' + player);
        },
        unban: function () {
          return msmExec('msm ' + name + ' bl remove ' + player);
        },
        addWhiteList: function () {
          return msmExec('msm ' + name + ' wl add ' + player);
        },
        removeWhiteList: function () {
          return msmExec('msm ' + name + ' wl remove ' + player);
        },
        kick: function () {
          return msmExec('msm ' + name + ' kick ' + player);
        },
        op: function (player) {
          return msmExec('msm ' + name + ' op add ' + player);
        },
        deop: function (player) {
          return msmExec('msm ' + name + ' op remove ' + player);
        },
        give: function (item, amount, data) {
          return msmExec('msm ' + name + ' give ' + player + ' ' + item + ' ' + amount + ' ' + data);
        },
        giveXp: function (amount) {
          return msmExec('msm ' + name + ' xp ' + player + ' ' + amount);
        }
      }; // end return for player
    } // end player object
  }; // end return for server
}
; // end server function
