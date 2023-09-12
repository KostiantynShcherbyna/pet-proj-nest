import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Game } from "./game"


@Entity()
export class Question {

  @PrimaryGeneratedColumn("uuid")
  QuestionId: string

  @Column()
  Body: string

  @Column()
  Published: boolean

  @Column()
  CreatedAt: string

  @Column({ nullable: true })
  UpdatedAt: string

  @Column({ array: true, type: "character varying" })
  CorrectAnswers: string[]

  @ManyToMany(() => Game, game => game.GameId)
  @JoinTable()
  Games: Game[]
}
