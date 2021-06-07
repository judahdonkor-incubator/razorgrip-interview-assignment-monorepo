import express from 'express'
import { router as user } from './user'
import { router as chat } from './chat'

const router = express.Router()
router.use('/user', user)
router.use('/chat', chat)

export { router }