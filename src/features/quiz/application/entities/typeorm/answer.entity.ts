import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { QuestionEntity } from "./question.entity"
import { GameEntity } from "./game.entity"
import { AccountEntity } from "../../../../sa/application/entities/sql/account.entity"

export enum AnswerStatusEnum { Correct = "Correct", Incorrect = "Incorrect"}

@Entity()
export class AnswerEntity {

  @PrimaryGeneratedColumn("uuid")
  AnswerId: string

  @Column()
  @OneToOne(() => GameEntity, game => game.GameId)
  Game: GameEntity

  @Column({ type: "enum", enum: AnswerStatusEnum })
  AnswerStatus: string

  @Column()
  @OneToOne(() => AccountEntity, user => user.UserId)
  User: AccountEntity

  @Column()
  AddedAt: string

  @Column()
  @OneToOne(() => QuestionEntity, quest => quest.QuestionId)
  Question: QuestionEntity
}
