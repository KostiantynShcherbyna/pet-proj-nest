import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Question } from "./question"
import { Game } from "./game"
import { AccountEntity } from "../../../../sa/application/entities/sql/account.entity"

export enum AnswerStatusEnum { Correct = "Correct", Incorrect = "Incorrect"}

@Entity()
export class Answer {

  @PrimaryGeneratedColumn("uuid")
  answerId: string

  @Column({ type: "enum", enum: AnswerStatusEnum })
  answerStatus: string

  @Column()
  addedAt: string

  @Column("uuid")
  @OneToOne(() => AccountEntity)
  userId: string

  @Column("uuid")
  @OneToOne(() => Game)
  gameId: string

  @Column("uuid")
  @OneToOne(() => Question)
  questionId: string
}
