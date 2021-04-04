const net = require('net')
const config = require('./config.json')

const remote_port = config.client.local_port;
const remote_host = config.server.host;
const data_port = config.server.data_port
const working_port = config.client.working_port;

const controller_socket = net.createConnection(remote_port, remote_host, () => {
    console.log('正在连接穿透服务器...')
})



run()

async function run () {
    await new Promise((resolve, reject) => {
        let remote_ok;
        controller_socket.on('connect', () => {
            console.log('远程连接成功')
            remote_ok = true
            if (check()) resolve()
        })

        function check() {
            if (remote_ok === true) return true;
            return false;
        }
    })
}

controller_socket.on('data', (d) => {
    const data_socket = net.createConnection(data_port, remote_host, () => {
        console.log('数据通道已连接...')
    })
    data_socket.write(d)
    const working_socket = net.createConnection(working_port, '0.0.0.0', () => {
        console.log('正在连接应用服务器...')
    })
    data_socket.pipe(working_socket)
    working_socket.pipe(data_socket)
})









