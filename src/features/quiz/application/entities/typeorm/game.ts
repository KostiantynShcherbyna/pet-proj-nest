import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Question } from "./question"

export enum StatusEnum {
  PendingSecondPlayer = "PendingSecondPlayer",
  Active = "Active",
  Finished = "Finished"
}

@Entity()
export class Game {

  @PrimaryGeneratedColumn("uuid")
  GameId: string

  @Column("uuid")
  FirstPlayerId: string

  @Column({ type: "uuid", nullable: true, default: null })
  SecondPlayerId: string | null

  @Column({ default: 0 })
  FirstPlayerScore: number

  @Column({ default: 0 })
  SecondPlayerScore: number

  @Column({ default: 0 })
  FirstPlayerAnswerNumber: number

  @Column({ default: 0 })
  SecondPlayerAnswerNumber: number

  @Column({
    type: "enum",
    enum: StatusEnum,
    default: "PendingSecondPlayer"
  })
  Status: string

  @Column()
  PairCreatedDate: string

  @Column({ nullable: true, default: null, type: "character varying" })
  StartGameDate: string | null

  @Column({ nullable: true, default: null, type: "character varying" })
  FinishGameDate: string | null

  @ManyToMany(() => Question, quest => quest.QuestionId)
  @JoinTable()
  Questions: Question[]

}


