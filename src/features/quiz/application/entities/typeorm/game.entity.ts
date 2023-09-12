import { Column, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { QuestionEntity } from "./question.entity"

export enum StatusEnum {
  PendingSecondPlayer = "PendingSecondPlayer",
  Active = "Active",
  Finished = "Finished"
}

@Entity()
export class GameEntity {

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

  @Column({ nullable: true, default: null })
  StartGameDate: string | null

  @Column({ nullable: true, default: null })
  FinishGameDate: string | null

  // @Column()
  // QuestionIds: string[]

  @Column()
  @ManyToMany(() => QuestionEntity, quest => quest.QuestionId)
  Questions: QuestionEntity[]

}


