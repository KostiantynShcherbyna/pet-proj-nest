import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class BlogEntity {

  @PrimaryGeneratedColumn("uuid")
  BlogId: string

  @Column()
  Name: string

  @Column()
  Description: string

  @Column()
  WebsiteUrl: string

  @Column()
  IsMembership: boolean

  @Column()
  CreatedAt: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  UserLogin: string

  @Column()
  IsBanned: boolean

  @Column({ nullable: true })
  BanDate: string

}
