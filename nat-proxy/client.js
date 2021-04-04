const net = require('net')
const config = require('./config.json')

const remote_port = config.server.local_port;
const remote_host = config.server.host;
const working_port = config.client.working_port;

const remote_socket = net.createConnection(remote_port, remote_host, () => {
    console.log('正在连接穿透服务器...')
})

const working_socket = net.createConnection(working_port, '0.0.0.0', () => {
    console.log('正在连接本地服务器...')
})

run()

async function run () {
    await new Promise((resolve, reject) => {
        let remote_ok;
        let app_ok;
        remote_socket.on('connect', () => {
            console.log('远程连接成功')
            remote_ok = true
            if (check()) resolve()
        })
        
        working_socket.on('connect', () => {
            console.log('本地连接成功')
            app_ok = true
            if (check()) resolve()
        })

        function check() {
            if (remote_ok === true && app_ok === true) return true;
            return false;
        }
    })

    remote_socket.pipe(working_socket)
    working_socket.pipe(remote_socket)
}










