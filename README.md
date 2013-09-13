# node-port-mux

Multiplex multiple services through one (TCP) port.

## How?

The muxer basically sniffs the initial data packet sent by the client to
determine (using a rule set) where to forward the request to.

## Why?

Instead of having to expose all your services to the outside world on their
respective ports, use a single port to access them all. Initially created
to multiplex HTTP, HTTPS and SOCKS5 traffic over one port for a personal
project.

## Install
From the NPM repository:
```
$ npm install port-mux
```

From the Github repository:
```
$ git clone https://github.com/robertklep/node-port-mux.git
$ cd node-port-mux
$ npm install [-g]
```

## Example

```javascript
var Muxer = require('port-mux');

// instantiate Muxer
Muxer()
  // match HTTP GET requests (using a prefix string match) and forward them to localhost:80
  .addRule('GET ', 80)

  // match TLS (HTTPS) requests (versions 3.{0,1,2,3}) using a regular expression
  .addRule(/^\x16\x03[\x00-\x03]/, '192.168.1.1:443') // regex match

  // you can also proxy UNIX domain sockets (which should already exist when you call .addRule()):
  .addRule(..., '/tmp/my-unix-domain-socket')

  // you can also pass a matcher function:
  .addRule(function(chunk) {
    // - chunk is a Buffer
    // - if the function returns true, the match is considered a success.
  }, ...)

  // pass a function as a third argument and it will get called (once the proxy
  // has connected to the service) using the proxy connection and original
  // (incoming) connection as arguments:
  .addRule(..., ..., function(proxy, conn) {
    var addr = proxy.address();
    console.log('Incoming connection from %s passed to %s:%s',
      conn.remoteAddress,
      addr.address,
      addr.port
    );
  })

  // start listening on port 3000
  .listen(3000);
```

## Performance impact

There's going to be a performance impact when using this module, since it's
proxying connections to the endpoint.

Using [httperf](http://www.hpl.hp.com/research/linux/httperf/), these are the
results I get on a Macbook Pro (using the modified version of the `example.js`
script in the repository):

Type of connection | Reqs/s | I/O speed | Remarks
------------------ |:------:| ---------:|:-------
Direct             | 9991   | 1863 KB/s | access HTTP server directly (not muxed)
Muxed (TCP)        | 4881   |  910 KB/s | HTTP server uses TCP sockets
Muxed (UNIX)       | 5629   | 1050 KB/s | HTTP server uses [UNIX domain sockets](http://nodejs.org/api/net.html#net_net_connect_path_connectlistener)

So performance impact is about 50%, a bit less when you use UNIX domain
sockets.

## LICENSE

Simplified BSD License ( *BSD-2-Clause* ).
