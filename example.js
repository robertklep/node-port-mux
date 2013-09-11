var Muxer = require('./src/port-mux.js');

new Muxer()
  .add('\x05', 8811)
  .add('\x16', 3333)
  .add(/^(?:GET|POST|PUT|DELETE)\s/, 3011)
  .listen(12346);
