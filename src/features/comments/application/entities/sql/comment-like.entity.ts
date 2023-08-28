import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { CommentEntity } from "./comment.entity"

@Entity()
export class CommentLikeEntity {

  @PrimaryGeneratedColumn("uuid")
  LikeId: string

  @Column({ type: "uuid" })
  CommentId: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  Status: string

  @JoinColumn({ name: "CommentId" })
  @ManyToOne(() => CommentEntity)
  CommentEntity: CommentEntity

}
