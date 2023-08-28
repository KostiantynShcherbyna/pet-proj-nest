import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class SentConfirmationCodeDateEntity {

  @PrimaryColumn({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  SentDate: string

  @JoinColumn({ name: "UserId" })
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}