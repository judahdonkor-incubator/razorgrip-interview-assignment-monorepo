import express, { Application } from 'express'
import morgan from 'morgan'
import { auth } from 'express-openid-connect'
import { router } from './router'
import { createWebSocket } from './web-socket'
import { cfg as dbCfg } from './db-cfg'
import { createConnection } from 'typeorm'
import { serveSPA } from './spa'
import process from 'process'

const PORT = process.env.PORT || 8080
const app: Application = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(auth({
    // authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    secret: process.env.SECRET
}))
app.use('/api', router)

// spa
const pathToSPA = process.argv[2]
if (pathToSPA)
    serveSPA(app, pathToSPA)

app.get('/api', (req, res) => res.send(JSON.stringify(req.oidc.user)))
app.post('/callback', (req, res) => console.log('called back - ' + JSON.stringify(req.oidc.user)))

createConnection(dbCfg)
    .then((_connection) => {
        const server = app.listen(PORT, () => console.log('express is running on port', PORT))
        createWebSocket(server)
    })
    .catch((err) => {
        console.log("Unable to connect to db", err);
        process.exit(1);
    })
