const net = require('net')
const config = require('config')
const localConfig = config.get('localConfig')
const remoteConfig = config.get('remoteConfig')
const through2 = require('through2')
const { encode, decode } = require('./cipher')

const client = net.createServer( exploreSocket => {
  const remoteSocket = new net.Socket()
  
  exploreSocket.on('error', e => {})
  remoteSocket.on('error', e => {})
  
  remoteSocket.connect(remoteConfig.port, remoteConfig.host, () => {
    exploreSocket.pipe(through2(encode)).pipe(remoteSocket)
    remoteSocket.pipe(through2(decode)).pipe(exploreSocket)
  })
})

client.listen(localConfig.port, localConfig.host, () => {
  console.log(`The localServer is running at ${localConfig.port} of ${localConfig.host}`);
})