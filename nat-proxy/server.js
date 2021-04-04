const net = require('net')
const config = require('./config.json')

const public_port = config.server.public_port
const local_port = config.server.local_port

let local_socket;

const public_server = net.createServer()

public_server.on('connection', (public_socket) => {
    if (local_socket) {
        try {
            public_socket.pipe(local_socket)
            local_socket.pipe(public_socket)
        } catch (e) {
            console.error(e)
        }
    } else {
        console.error('未能连接客户端')
    }
})

public_server.listen(public_port, '0.0.0.0', () => {
    console.log(`公网服务已开启，端口:${public_port}`)
})

const local_server = net.createServer((socket) => {
    
})

local_server.on('connection', (s) => {
    local_socket = s
    console.log(`客户端已接入: ${s.remoteAddress}:${s.remotePort}`)
})


local_server.listen(local_port, '0.0.0.0', () => {
    console.log(`NAT穿透服务已开启，端口:${local_port}`)
})