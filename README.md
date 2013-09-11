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
new Muxer()
  // match HTTP GET requests and forward them to localhost:80
  .add("GET ", 80)                                            // string
  // match TLS (HTTPS) requests (versions 3.{0,1,2,3})
  .add(/^\x16\x03[\x00-\x03]/, '192.168.1.1:443') // regex
  // you can also pass a matcher function:
  .add(function(chunk) {
    // - chunk is a Buffer
    // - if the function returns true, the match is considered a success.
  }, 1234)
  // start listening on port 3000
  .listen(3000);
```

## LICENSE

Simplified BSD License ( *BSD-2-Clause* ).
