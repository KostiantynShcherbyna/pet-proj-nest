import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm"

enum StatusEnum {
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

}


