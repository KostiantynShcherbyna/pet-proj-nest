import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class QuestionEntity {

  @PrimaryGeneratedColumn("uuid")
  QuestionId: string

  @Column()
  Body: string

  @Column()
  Published: boolean

  @Column()
  CreatedAt: string

  @Column({ nullable: true })
  UpdatedAt: string | null

  @Column({ default: [] })
  CorrectAnswers: string[]

  @Column({ default: [] })
  GameIds: string[]
}
