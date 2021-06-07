import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class BlockedUser {
    @PrimaryColumn()
    senderId!: string;
    @PrimaryColumn()
    recipientId!: string;
}