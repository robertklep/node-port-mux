var Muxer = require('port-mux');

// start HTTP server on port 3001
require('http').createServer(function(req, res) {
  res.end('hello world from HTTP');
}).listen(3001);

// start HTTPS server on port 3002
var fs      = require('fs');
var options = {
  key : fs.readFileSync('server.key'), // !!! change these
  cert: fs.readFileSync('server.crt')  // !!!
};
require('https').createServer(options, function(req, res) {
  res.end('hello world from HTTPS');
}).listen(3002);

// configure and start muxer
Muxer()
  // forward HTTP to port 3001
  .addRule(/^(?:GET|POST|PUT|DELETE)\s/, 3001, function(proxy, conn) {
    var addr = proxy.address();
    console.log('Incoming connection from %s passed to %s:%s',
      conn.remoteAddress,
      addr.address,
      addr.port
    );
  })
  // forward HTTPS to port 3002
  .addRule(/^\x16\x03[\x00-\x03]/, 3002)
  // start listening; .listen() accepts the same arguments as net.Server#listen()
  .listen(3000, function() {
    var addr = this.address();
    console.warn('Muxer listening on %s:%s', addr.address, addr.port);
  })
  // .listen() returns the net.Server instance, so we can attach event handlers
  .on('connection', function(conn) {
    console.log('%s - connection from %s', new Date(), conn.remoteAddress);
  });

// Check the results with curl:
//
// $ curl http://localhost:3000/
// hello world from HTTP
// $ curl -k https://localhost:3000/
// hello world from HTTPS
