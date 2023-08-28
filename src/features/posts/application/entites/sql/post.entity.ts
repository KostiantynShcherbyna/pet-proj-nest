import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

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

}
