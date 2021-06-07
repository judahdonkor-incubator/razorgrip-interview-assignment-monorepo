import { getRepository, Repository } from "typeorm";
import { sendMessage as sendWebSocketMessage } from "../web-socket";
import { Message } from './message';

export class Controller {
    private repos: Repository<Message>
    constructor() { this.repos = getRepository(Message) }
    async getChat(params: [string, string]): Promise<Message[]> {
        return this.repos
            .createQueryBuilder('m')
            .where('(m.recipientId = :x and m.senderId = :y) or (m.recipientId = :y and m.senderId = :x)', {
                x: params[0],
                y: params[1]
            })
            .getMany()
    }
    async sendMessage(message: Omit<Message, 'id'>): Promise<void> {
        const data = await this.repos.save(message)
        sendWebSocketMessage({
            data: {
                message: 'new-message',
                data
            },
            sub: [data.recipientId, data.senderId]
        })
    }
}

export { router } from './router'

export {
    Message
}