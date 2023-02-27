import {Entity, Unique, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity({name: "movies"})
export class MovieORM {
    @PrimaryGeneratedColumn("uuid")
    id: string
    
    @Column("int")
    year: number

    @Column({length: 255})
    title: string

    @Column({length: 255})
    studio: string

    @Column({length: 255})
    director: string

    openingPhrase:string
}