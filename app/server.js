const net = require('net')
const through2 = require('through2')
const createHeaderParser = require('./utils/headerParser')
const { server: serverConfig } = require('../config.json');
const { encode } = require('./utils/cipher')

const TUNNEL_RESPONSE = 'HTTP/1.1 200 Connection Established\r\n' + 'Proxy-agent: Node.js-Proxy\r\n' + '\r\n';
let TUNNEL_RESPONSE_ENCODED = Buffer.from(TUNNEL_RESPONSE);
for(let i = 0; i < TUNNEL_RESPONSE_ENCODED.length; i++){
  TUNNEL_RESPONSE_ENCODED[i] = 255 - TUNNEL_RESPONSE_ENCODED[i]
}

net.createServer(createHeaderParser((headers, clientSocket) => {
  const appSocket = new net.Socket()

  appSocket.on('error', e => {})
  clientSocket.on('error', e => {})
  
  if (headers.method === 'CONNECT') {
    clientSocket.once('data', chunk => {
      const [host, port] = headers.url.split(':')
      appSocket.connect(port, host, () => {
        clientSocket.write(TUNNEL_RESPONSE_ENCODED)
        clientSocket.pipe(through2(function(chunk, enc, callback){
          this.push(chunk)
          callback()
        })).pipe(appSocket)
        appSocket.pipe(through2(encode)).pipe(clientSocket)
      })
    })
  } else {
    clientSocket.once('data', chunk => {
      appSocket.connect(80, headers.headers.host, () => {
        appSocket.write(chunk)
        appSocket.pipe(through2(encode)).pipe(clientSocket)
        clientSocket.pipe(appSocket)
      })
    })
  }
})).listen(serverConfig.port, () => {
  console.log(`The remote proxy server is running at ${serverConfig.port}`);
})