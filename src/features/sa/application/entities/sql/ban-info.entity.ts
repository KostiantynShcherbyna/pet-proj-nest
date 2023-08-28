import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class BanInfoEntity {

  @PrimaryColumn({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  IsBanned: string

  @Column()
  BanDate: string

  @Column()
  BanReason: string

  @JoinColumn({ name: "UserId" })
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}