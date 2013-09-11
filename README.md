# node-port-mux

Multiplex multiple services through one (TCP) port.

## How?

The muxer basically sniffs the initial data packet sent by the client to
determine (using a rule set) where to forward the request to.

## Install
```
npm install port-mux
```

## Example

```javascript
var Muxer = require('node-mux');

// instantiate Muxer
new Muxer()
  // match HTTP GET requests and forward them to localhost:80
  .add("GET ", 80)                                            // string
  // match TLS (HTTPS) requests (versions 3.{0,1,2,3})
  .add(/^\x16\x03(?:\x00|\x01|\x02|\x03)/, '192.168.1.1:443') // regex
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
