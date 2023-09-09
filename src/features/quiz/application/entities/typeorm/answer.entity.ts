import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm"

enum AnswerStatusEnum { Correct = "Correct", Incorrect = "Incorrect"}

@Entity()
export class AnswerEntity {

  @PrimaryGeneratedColumn("uuid")
  AnswerId: string

  @Column("uuid")
  GameId: string

  @Column("uuid")
  QuestionId: string

  @Column({ type: "enum", enum: AnswerStatusEnum })
  AnswerStatus: string

  @Column("uuid")
  UserId: string

  @Column()
  AddedAt: string

}
