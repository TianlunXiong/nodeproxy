const net = require('net')
const createHeaderParser = require('./headerParser')
const config = require('config')
const remoteConfig = config.get('remoteConfig')
const through2 = require('through2')
const { encode } = require('./cipher')

const raw = 'HTTP/1.1 200 Connection Established\r\n' +
'Proxy-agent: Node.js-Proxy\r\n' + '\r\n';
let rawBuffer = Buffer.from(raw);
for(let i = 0; i < rawBuffer.length; i++){
  rawBuffer[i] = 255 - rawBuffer[i]
}

net.createServer(createHeaderParser((headers, stream) => {
  const remoteSocket = new net.Socket()

  remoteSocket.on('error', e => {})
  stream.on('error', e => {})
  
  if (headers.method === 'CONNECT') {
    stream.once('data', chunk => {
      const [host, port] = headers.url.split(':')
      remoteSocket.connect(port, host, () => {
        stream.write(rawBuffer)
        stream.pipe(through2(function(chunk, enc, callback){
          this.push(chunk)
          callback()
        })).pipe(remoteSocket)
        remoteSocket.pipe(through2(encode)).pipe(stream)
      })
    })
  } else {
    stream.once('data', chunk => {
      remoteSocket.connect(80, headers.headers.host, () => {
        remoteSocket.write(chunk)
        remoteSocket.pipe(through2(encode)).pipe(stream)
        stream.pipe(remoteSocket)
      })
    })
  }
})).listen(remoteConfig.port, () => {
  console.log(`The remote proxy server is running at ${remoteConfig.port}`);
})