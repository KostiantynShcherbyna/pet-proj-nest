import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class AccountEntity {

  @PrimaryGeneratedColumn("uuid")
  UserId: string

  @Column({ nullable: false })
  Login: string

  @Column({ nullable: false })
  Email: string

  @Column({ nullable: false })
  PasswordHash: string

  @Column({ nullable: false })
  CreatedAt: string

}