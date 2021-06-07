import express from 'express'
import { Controller } from '.'

const router = express.Router()

router.post('/message', async (req, res) => {
    const controller = new Controller()
    await controller.sendMessage(Object.assign({}, req.body, {
        senderId: String(req.oidc.user?.sub)
    }))
    return res.send()
})

router.get('/:id', async (req, res) => {
    const controller = new Controller()
    return res.send(await controller.getChat([
        String(req.oidc.user?.sub),
        String(req.params.id)
    ]))
})

export { router }