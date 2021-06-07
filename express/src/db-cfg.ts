import { ConnectionOptions } from "typeorm";
import { BlockedUser, Online } from './user'
import { Message } from './chat'

export const cfg: ConnectionOptions = {
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [Message, BlockedUser, Online],
    synchronize: true,
    ssl: {
        rejectUnauthorized: false
    }
}