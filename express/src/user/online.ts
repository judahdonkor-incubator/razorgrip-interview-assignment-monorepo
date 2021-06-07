import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Online {
    @PrimaryColumn()
    userId!: string;
}