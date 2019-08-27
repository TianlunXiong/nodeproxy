const events = require('events')
const through2 = require('through2')
const duplexify = require('duplexify')
const httpHeaders = require('http-headers')
const { decode } = require('./cipher')

module.exports = function parseHttpHeader(callback) {
  return socket => {
    let parsed = false;
    const headerEvents = new events.EventEmitter();

    const headerParserTransform = function (chunk, enc, callback) {
      if (!parsed) {
        parsed = true;
        headerEvents.emit('headers', httpHeaders(chunk));
      }
      callback(null, chunk);
    };

    const transfromStream = through2(headerParserTransform);


    headerEvents.once('headers', headers => {
      callback(headers, duplexify(socket, transfromStream));
    });

    socket.pipe(through2(decode)).pipe(transfromStream);
  };
}