import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { PostEntity } from "./post.entity"

@Entity()
export class PostLikeEntity {

  @PrimaryGeneratedColumn("uuid")
  LikeId: string

  @Column()
  Status: string

  @Column({ type: "uuid" })
  PostId: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  UserLogin: string

  @Column()
  AddedAt: string

  @JoinColumn({ name: "PostId" })
  @ManyToOne(() => PostEntity)
  PostEntity: PostEntity

}
