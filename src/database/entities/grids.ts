import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity({name: "grids"})
export class Grids {
    @PrimaryGeneratedColumn("uuid")
    gridId: string

    @Column("int")
    problemNumber: number

    @Column("smallint")
    width: number

    @Column("smallint")
    height: number

    @Column({length: 255})
    label: string

    @Column("int", {array: true})
    data: number[][]

    @Column({length: 255})
    interpretAs: string
}