const net = require('net')
const createHeaderParser = require('stream-http-header-parser')
const config = require('config')
const remoteConfig = config.get('remoteConfig')
 
net.createServer(createHeaderParser((headers, stream) => {
  const remoteSocket = new net.Socket()

  remoteSocket.on('error', e => {})
  stream.on('error', e => {})
  
  if (headers.method === 'CONNECT') {
    stream.once('data', chunk => {
      const [host, port] = headers.url.split(':')
      remoteSocket.connect(port, host, () => {
        stream.write('HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: Node.js-Proxy\r\n' +
          '\r\n')
        stream.pipe(remoteSocket)
        remoteSocket.pipe(stream)
      })
    })
  } else {
    stream.once('data', chunk => {
      remoteSocket.connect(80, headers.headers.host, () => {
        remoteSocket.write(chunk)
        remoteSocket.pipe(stream)
        stream.pipe(remoteSocket)
      })
    })
  }
})).listen(remoteConfig.port, remoteConfig.host, () => {
  console.log(`The remote proxy server is running at ${remoteConfig.port} of ${remoteConfig.host}`);
})