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

  @Column({ nullable: true, type: "uuid" })
  UserId: string

  @Column({ nullable: true })
  UserLogin: string

  @Column({ nullable: true })
  IsBanned: boolean

  @Column({ nullable: true })
  BanDate: string

}
