var net = require('net');

var Muxer = module.exports = function Muxer(options) {
  if (this.constructor.name !== 'Muxer')
    return new Muxer(options);
  this.services = [];
  return this;
};

Muxer.prototype.addRule = Muxer.prototype.add = function(matcher, handler) {
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
  var server = this.server = net.createServer(function(conn) {
    var proxy = null;

    // Handle errors on connection.
    conn.on('error', function(e) {
      conn.destroy();
      if (proxy)
        proxy.destroy();
      // XXX: propagate to server? not for now.
      // server.emit('error', e);
    });

    // Wait for the first data event.
    conn.once('data', function(chunk) {
      // Find a matching service for this chunk.
      for (var i = 0, len = services.length; i < len; i++) {
        var service = services[i];
        if (service.matcher(chunk) === true) {
          // Found one: create a connection to it.
          proxy = net.connect(service.handler.port, service.handler.address);

          // Handle errors on proxy stream.
          proxy.on('error', function(e) {
            proxy.destroy();
            conn.destroy();
            // XXX: propagate to server? not for now.
            // server.emit('error', e);
          });

          // Write the first chunk of data (XXX: wait for 'writable'?)
          proxy.write(chunk);

          // Pipe connection to proxy and vice versa.
          conn.pipe(proxy);
          proxy.pipe(conn);

          // Done.
          return;
        }
      }
      // No matcher found: destroy connection.
      return conn.destroy();
    });
  });

  // Start listening.
  this.server.listen.apply(this.server, arguments);

  // Done.
  return this.server;
};
