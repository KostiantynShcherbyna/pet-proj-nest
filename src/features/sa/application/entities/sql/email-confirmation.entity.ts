import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class EmailConfirmationEntity {

  @PrimaryColumn({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  IsConfirmed: string

  @Column({ type: "uuid", nullable: false })
  ConfirmationCode: string

  @Column({ nullable: false })
  ExpirationDate: string

  @JoinColumn({ name: "UserId" })
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}