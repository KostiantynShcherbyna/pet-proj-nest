import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Question } from "./question"

export enum QuizStatusEnum {
  PendingSecondPlayer = "PendingSecondPlayer",
  Active = "Active",
  Finished = "Finished"
}

@Entity()
export class Game {

  @PrimaryGeneratedColumn("uuid")
  gameId: string

  @Column("uuid")
  firstPlayerId: string

  @Column({ type: "uuid", nullable: true, default: null })
  secondPlayerId: string | null

  @Column({ default: 0 })
  firstPlayerScore: number

  @Column({ default: 0 })
  secondPlayerScore: number

  @Column({ default: 0 })
  firstPlayerAnswerNumber: number

  @Column({ default: 0 })
  secondPlayerAnswerNumber: number

  @Column({
    type: "enum",
    enum: QuizStatusEnum,
    default: "PendingSecondPlayer"
  })
  status: string

  @Column()
  pairCreatedDate: string

  @Column({ nullable: true, default: null, type: "character varying" })
  startGameDate: string | null

  @Column({ nullable: true, default: null, type: "character varying" })
  finishGameDate: string | null

  @Column({ type: "character varying", array: true, nullable: true })
  questionIds: string[] | null

}


