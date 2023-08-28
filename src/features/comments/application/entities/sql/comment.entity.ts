import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class CommentEntity {

  @PrimaryGeneratedColumn("uuid")
  CommentId: string

  @Column({ type: "uuid", nullable: false })
  PostId: string

  @Column({ nullable: false })
  Content: string

  @Column({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  UserLogin: string

  @Column({ nullable: false })
  CreatedAt: string

}
