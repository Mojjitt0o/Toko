const http = require('node:http')
const app = require('./app')

const server = http.createServer(app)
const port = process.env.NODE_PORT || 3002

const listener = server.listen(port, () => console.log(`BingleShop app listening on port ${port}`))

const { Server } = require('socket.io')
const { socketController } = require('./controllers')

const io = new Server(listener)

socketController.setup(io)

process.on('SIGINT', () => {
    server.close((err) => {
        if (err) {
            console.log(err)
            process.exit(1)
        }

        console.log("BingleShop shutdown... see you later :)")
        process.exit(0)
    })
})

process.on('SIGTERM', () => {
    listener.close((err) => {
        if (err) {
            console.log(err)
            process.exit(1)
        }
        console.log("BingleShop shutdown... see you later :)")
        process.exit(1)
    })
})