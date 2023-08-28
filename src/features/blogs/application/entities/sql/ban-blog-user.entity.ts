import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { BlogEntity } from "./blog.entity"

@Entity()
export class BanBlogUserEntity {

  @PrimaryGeneratedColumn("uuid")
  BanId: boolean

  @Column({ type: "uuid" })
  BlogId: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  IsBanned: boolean

  @Column({ nullable: true })
  BanReason: string

  @Column({ nullable: true })
  BanDate: string

  @JoinColumn({ name: "BlogId" })
  @ManyToOne(() => BlogEntity)
  BlogEntity: BlogEntity
}
