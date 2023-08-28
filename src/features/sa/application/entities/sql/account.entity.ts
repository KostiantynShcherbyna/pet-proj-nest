import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class AccountEntity {

  @PrimaryGeneratedColumn("uuid")
  UserId: string

  @Column()
  Login: string

  @Column()
  Email: string

  @Column()
  PasswordHash: string

  @Column()
  CreatedAt: string

}