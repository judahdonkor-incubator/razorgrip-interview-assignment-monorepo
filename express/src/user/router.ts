import express from 'express'
import { Controller } from '.'

const router = express.Router()

router.patch('/blocked/:id', async (req, res) => {
    const controller = new Controller()
    await controller.blockUser({
        senderId: String(req.params.id),
        recipientId: String(req.oidc.user?.sub),
    })
    return res.send()
})

router.delete('/blocked/:id', async (req, res) => {
    const controller = new Controller()
    await controller.unblockUser({
        senderId: String(req.params.id),
        recipientId: String(req.oidc.user?.sub),
    })
    return res.send()
})

router.get('/', (req, res) => res.send(req.oidc.user))

export { router }