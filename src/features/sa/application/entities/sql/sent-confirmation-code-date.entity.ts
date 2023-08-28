import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class SentConfirmationCodeDateEntity {

  @PrimaryColumn({ type: "uuid" })
  UserId: string

  @Column()
  SentDate: string

  @JoinColumn({ name: "UserId" })
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}