const net = require('net')

const client = net.createServer( exploreSocket => {
  const remoteSocket = new net.Socket()
  
  exploreSocket.on('error', e => console.log(e))
  remoteSocket.on('error', e => console.log(e))
  remoteSocket.connect(9999, '127.0.0.1', () => {
    exploreSocket.pipe(remoteSocket)
    remoteSocket.pipe(exploreSocket)
  })
})

client.listen(1337)