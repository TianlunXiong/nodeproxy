const net = require('net')
const through2 = require('through2')
const { client: clientConfig, server: serverConfig } = require('../config.json')
const { encode, decode } = require('./utils/cipher')

const client = net.createServer(comingSocket => {
  const remoteSocket = new net.Socket()

  comingSocket.on('error', e => { })
  remoteSocket.on('error', e => { })

  remoteSocket.connect(serverConfig.port, serverConfig.ip, () => {
    comingSocket.pipe(through2(encode)).pipe(remoteSocket)
    remoteSocket.pipe(through2(decode)).pipe(comingSocket)
  })
})

client.listen(clientConfig.port, clientConfig.ip, () => {
  console.log(`The localServer is running at ${clientConfig.port} of ${clientConfig.ip}`)
})