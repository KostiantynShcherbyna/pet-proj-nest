import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class BlogEntity {

  @PrimaryGeneratedColumn("uuid")
  BlogId: string

  @Column({ nullable: false })
  Name: string

  @Column({ nullable: false })
  Description: string

  @Column({ nullable: false })
  WebsiteUrl: string

  @Column({ nullable: false })
  IsMembership: boolean

  @Column({ nullable: false })
  CreatedAt: string

  @Column({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  UserLogin: string

  @Column()
  IsBanned: boolean

  @Column()
  BanDate: string

}
