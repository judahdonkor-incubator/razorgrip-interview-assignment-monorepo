import {
    Column, Entity,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    senderId!: string;
    @Column()
    recipientId!: string;
    @Column()
    message!: string;
}