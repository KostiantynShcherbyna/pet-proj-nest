import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class CommentEntity {

  @PrimaryGeneratedColumn("uuid")
  CommentId: string

  @Column({ type: "uuid" })
  PostId: string

  @Column()
  Content: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  UserLogin: string

  @Column()
  CreatedAt: string

}
