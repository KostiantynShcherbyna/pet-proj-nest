import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { BlogEntity } from "./blog.entity"

@Entity()
export class BanBlogUserEntity {

  @PrimaryGeneratedColumn("uuid")
  BanId: boolean

  @Column({ type: "uuid", nullable: false })
  BlogId: string

  @Column({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  IsBanned: boolean

  @Column()
  BanReason: string

  @Column()
  BanDate: string

  @JoinColumn({ name: "BlogId" })
  @ManyToOne(() => BlogEntity)
  BlogEntity: BlogEntity
}
