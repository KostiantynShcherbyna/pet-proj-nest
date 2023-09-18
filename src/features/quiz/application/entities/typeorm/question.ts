import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Game } from "./game"


@Entity()
export class Question {

  @PrimaryGeneratedColumn("uuid")
  questionId: string

  @Column()
  body: string

  @Column({ default: false })
  published: boolean

  @Column()
  createdAt: string

  @Column({ nullable: true, default: null })
  updatedAt: string

  @Column({ array: true, type: "character varying" })
  correctAnswers: string[]

}
