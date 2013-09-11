var net = require('net');

var Muxer = module.exports = function(options) {
  this.services = [];
  return this;
};

Muxer.prototype.add = function(matcher, handler) {
  var type = matcher.constructor.name;

  // Process matcher.
  if (type === 'RegExp') {
    var regex = matcher;
    matcher = function(chunk) {
      return regex.test(chunk.toString());
    };
  } else if (type === 'String') {
    var value = matcher;
    matcher = function(chunk) {
      return value === chunk.toString().substring(0, value.length);
    };
  } else if (type !== 'Function') {
    throw new Error('Unknown handler type (can handle functions, regex and strings)');
  }

  // Process handler ('[ADDRESS:]PORT' only for now).
  var address = '127.0.0.1';
  var port    = null;
  var s       = String(handler).split(':');
  if (s.length === 1) {
    port = s[0];
  } else if (s.length === 2) {
    address = s[0] || address;
    port    = s[1];
  }
  if (port === null)
    throw new Error('Invalid handler address (should be "[ADDRESS:]PORT")');

  // Add to list of services.
  this.services.push({
    matcher : matcher,
    handler : {
      address : address,
      port    : port
    }
  });

  // Done.
  return this;
};

Muxer.prototype.listen = function() {
  var services  = this.services;
  this.server   = net.createServer(function(conn) {
    var first = true;
    conn.on('data', function(chunk) {
      if (! first)
        return;
      first = false;
      var found_match = false;
      services.forEach(function(service) {
        if (! found_match && service.matcher(chunk) === true) {
          found_match = true;
          var proxy = net.connect(service.handler.port, service.handler.address);
          proxy.write(chunk);
          conn.pipe(proxy);
          proxy.pipe(conn);
        }
      });
      if (! found_match) {
        // XXX: handle error?
      }
    });
  });
  this.server.listen.apply(this.server, arguments);
  return this.server;
};
