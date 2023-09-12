import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Question } from "./question"
import { Game } from "./game"
import { AccountEntity } from "../../../../sa/application/entities/sql/account.entity"

export enum AnswerStatusEnum { Correct = "Correct", Incorrect = "Incorrect"}

@Entity()
export class Answer {

  @PrimaryGeneratedColumn("uuid")
  AnswerId: string

  @Column({ type: "enum", enum: AnswerStatusEnum })
  AnswerStatus: string

  @Column()
  AddedAt: string

  @OneToOne(() => AccountEntity, user => user.UserId)
  User: AccountEntity

  @OneToOne(() => Game, game => game.GameId)
  Game: Game

  @OneToOne(() => Question, quest => quest.QuestionId)
  Question: Question
}
