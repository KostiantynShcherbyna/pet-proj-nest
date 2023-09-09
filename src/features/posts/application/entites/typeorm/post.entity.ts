import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { PostLikeEntity } from "./post-like.entity"

@Entity()
export class PostEntity {

  @PrimaryGeneratedColumn("uuid")
  PostId: string

  @Column({ nullable: false })
  Content: string

  @Column({ nullable: false })
  Title: string

  @Column({ nullable: false })
  ShortDescription: string

  @Column({ type: "uuid", nullable: false })
  BlogId: string

  @Column({ nullable: false })
  BlogName: string

  @Column({ nullable: false })
  CreatedAt: string

  @JoinColumn({ name: "PostId" })
  @OneToMany(() => PostLikeEntity, pl => pl.PostId)
  PostLikeEntity: PostLikeEntity

}
