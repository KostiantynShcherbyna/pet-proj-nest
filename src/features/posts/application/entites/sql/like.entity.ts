import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { PostEntity } from "./post.entity"

@Entity()
export class LikeEntity {

  @PrimaryGeneratedColumn("uuid")
  LikeId: string

  @Column({ nullable: false })
  Status: string

  @Column({ type: "uuid", nullable: false })
  PostId: string

  @Column({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  UserLogin: string

  @Column({ nullable: false })
  AddedAt: string

  @JoinColumn({ name: "PostId" })
  @ManyToOne(() => PostEntity)
  PostEntity: PostEntity

}
