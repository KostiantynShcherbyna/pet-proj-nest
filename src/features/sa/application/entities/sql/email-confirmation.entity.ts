import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class EmailConfirmationEntity {

  @PrimaryColumn({ type: "uuid" })
  UserId: string

  @Column()
  IsConfirmed: string

  @Column({ type: "uuid", nullable: true })
  ConfirmationCode: string

  @Column({ nullable: true })
  ExpirationDate: string

  @JoinColumn({ name: "UserId" })
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}