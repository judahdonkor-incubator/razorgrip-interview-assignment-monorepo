import WebSocket, { Server as WSServer } from 'ws'
import { Server } from 'http'
import { Controller } from './user'
import { pub, sub } from './redis'


type Data = {
    message: 'users-online' | 'blocked-users' | 'user-online' | 'user-offline' | 'user-blocked' | 'user-unblocked' | 'new-message'
    data?: any
} & { [key in string]: any }

const ws = new WSServer({ noServer: true });

// redis
const CHANNEL = 'ws:msg'
sub.on('message', (channel, message) => {
    if (channel === CHANNEL) {
        const { data, sub } = JSON.parse(message)
        // to sockets of a specific user
        if (sub) {
            for (const c of ws.clients) {
                const newSub = (c as any)._socket.sub
                if (
                    (typeof sub === 'string')
                        ? newSub === sub
                        : sub.includes(newSub)
                        && c.readyState === WebSocket.OPEN
                ) c.send(JSON.stringify(data))
            }

            return
        }
        // to all users
        for (const c of ws.clients)
            c.send(JSON.stringify(data))
    }
})
sub.subscribe(CHANNEL)

const sendMessage = ({
    data,
    sub,
    socket
}: {
    data: Data
    sub?: string | string[]
    socket?: WebSocket
}) => {
    // to a specific socket
    if (socket) {
        socket.send(JSON.stringify(data))
        return
    }
    // to sockets of a specific user or all users
    pub.publish(CHANNEL, JSON.stringify({ data, sub }))
}

ws.on('connection', async socket => {
    const userController = new Controller
    const sub = (socket as any)._socket.sub
    // add-online-user
    userController.addOnlineUser(sub)
    // blocked-users
    sendMessage({
        data: {
            message: 'blocked-users',
            data: await userController.getBlockedUsers(sub)
        },
        socket: socket as any
    })
    // users-online
    sendMessage({
        data: {
            message: 'users-online',
            data: await userController.getOnlineUsers(sub)
        },
        socket: socket as any
    })
    // handle close event
    socket.on("close", () => {
        console.log("closed", ws.clients.size);
        // remove-online-user
        userController.removeOnlineUser(sub)
    });
})

const createWebSocket = (server: Server) => {
    server.on('upgrade', (request, socket, head) => {
        try {
            // skimpy authentication ... complete later
            const searchParams = new URLSearchParams(String(request.url).substr(2))
            const token = searchParams.get('token')
            if (!token)
                throw Error('Invalid token')
            socket['sub'] = token
            ws.handleUpgrade(request, socket, head, socket => {
                ws.emit('connection', socket, request);
            })
        } catch (error) {
            console.log("upgrade exception", error);
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return
        }
    })
}

export { createWebSocket, sendMessage }