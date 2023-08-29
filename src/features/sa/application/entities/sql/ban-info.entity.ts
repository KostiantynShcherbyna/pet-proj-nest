import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class BanInfoEntity {

  @PrimaryColumn({ type: "uuid" })
  UserId: string

  @Column()
  IsBanned: boolean

  @Column({ nullable: true })
  BanDate: string

  @Column({ nullable: true })
  BanReason: string

  @JoinColumn({ name: "UserId" })
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}