const net = require('net')
const config = require('./config.json')

const public_port = config.server.public_port
const local_port = config.client.local_port
const data_port = config.server.data_port

const publicSocketMap = new Map();
const dataSocketMap = new Map();

let controller_socket = new net.Socket()

const public_server = net.createServer()



public_server.on('connection', (public_socket) => {
    const n = Math.random().toFixed(20);
    controller_socket.write(n);
    publicSocketMap.set(n, public_socket);
    public_socket.on('close', () => {
        publicSocketMap.delete(n)
        console.log('外部连接已关闭')
    })
})

setInterval(() => {
    public_server.getConnections((err, count) => {
        console.log(`${new Date().toLocaleString()} 连接数: ${count}`)
    })
}, 2000)

public_server.listen(public_port, '0.0.0.0', () => {
    console.log(`公网服务已开启，端口:${public_port}`)
})

const controller_server = net.createServer()

controller_server.on('connection', (socket) => {
    controller_socket = socket
    console.log(`控制通道已接入: ${socket.remoteAddress}:${socket.remotePort}`)
})


controller_server.listen(local_port, '0.0.0.0', () => {
    console.log(`控制通道已开启，端口:${local_port}`)
})

const data_server = net.createServer()

data_server.on('connection', (data_socket) => {
    console.log(`数据通道已接入: ${data_socket.remoteAddress}:${data_socket.remotePort}`)
    data_socket.on('data', (d) => {
        const pub_socket = publicSocketMap.get(`${d}`)
        if (pub_socket) {
            pub_socket.pipe(data_socket)
            data_socket.pipe(pub_socket)
        }
    })
})

data_server.listen(data_port, '0.0.0.0', () => {
    console.log(`数据通道已开启，端口:${data_port}`)
})


