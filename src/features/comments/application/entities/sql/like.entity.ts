import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { CommentEntity } from "./comment.entity"

@Entity()
export class LikeEntity {

  @PrimaryGeneratedColumn("uuid")
  LikeId: string

  @Column({ type: "uuid", nullable: false })
  CommentId: string

  @Column({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  Status: string

  @JoinColumn({ name: "CommentId" })
  @ManyToOne(() => CommentEntity)
  CommentEntity: CommentEntity

}
