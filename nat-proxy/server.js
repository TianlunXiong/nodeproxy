const net = require('net')
const config = require('./config.json')

const public_port = config.server.public_port
const local_port = config.client.local_port
const data_port = config.server.data_port

const publicSocketMap = {};
const dataSocketMap = {};

let controller_socket = new net.Socket()

const public_server = net.createServer()


public_server.on('connection', (public_socket) => {
    const session_key = Math.random().toFixed(20);
    const msg_obj = {
        type: 'add',
        key: session_key,
    }
    publicSocketMap[session_key] = public_socket;
    controller_socket.write(JSON.stringify(msg_obj) + '\n');
    console.log('反弹信号已发送')
    
    public_socket.on('end', () => {
        console.log('外部连接发送FIN')
        delete publicSocketMap[session_key]
        if (dataSocketMap[session_key]) {
            dataSocketMap.end();
            public_socket.end();
        }
    })
    public_socket.on('close', () => {
        console.log('外部连接已关闭')
    })
})

setInterval(() => {
    const t = new Date().toLocaleString()
    public_server.getConnections((err, count) => {
        console.log(`\n[${t}] 公网连接数: ${count}`)
    })
    data_server.getConnections((err, count) => {
        console.log(`[${t}] 数据连接数: ${count}`)
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
        const sp = d.toString().split('\n')
        sp.forEach((item) => {
            if (item) bridge(item, data_socket)
        })
    })
})

function bridge(jsonStr, data_socket) {
    try {
        const obj = JSON.parse(jsonStr)
        const pub_socket = publicSocketMap[obj.key]
        if (pub_socket) {
            pub_socket.on('error', (e) => {
                console.error(e)
            })
            data_socket.on('error', (e) => {
                console.error(e)
            })
            pub_socket.pipe(data_socket)
            data_socket.pipe(pub_socket)
        }
    } catch (e) {
        console.error(e)
    }
}

data_server.listen(data_port, '0.0.0.0', () => {
    console.log(`数据通道已开启，端口:${data_port}`)
})


