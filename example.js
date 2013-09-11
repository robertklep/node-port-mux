var Muxer = require('port-mux');

new Muxer()
  // forward HTTP to port 3001
  .add(/^(?:GET|POST|PUT|DELETE)\s/, 3001)
  // forward HTTPS to port 3002
  .add(/^\x16\x03(?:\x00|\x01|\x02|\x03)/, 3002)
  // start listening
  .listen(3000);

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

// Check the results with curl:
//
// $ curl http://localhost:3000/
// hello world from HTTP
// $ curl -k https://localhost:3000/
// hello world from HTTPS
