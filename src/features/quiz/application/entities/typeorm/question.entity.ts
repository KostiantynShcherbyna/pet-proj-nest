import { Column, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { GameEntity } from "./game.entity"


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

  @Column()
  @ManyToMany(() => GameEntity, game => game.Questions)
  Games: GameEntity[]
}
