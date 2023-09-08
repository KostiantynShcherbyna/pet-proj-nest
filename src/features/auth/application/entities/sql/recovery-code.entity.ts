import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { AccountEntity } from "../../../../sa/application/entities/sql/account.entity"

@Entity()
export class RecoveryCodeEntity {

  @PrimaryGeneratedColumn()
  RecoveryCodeId: number

  @Column({ nullable: false })
  Email: string

  @Column({ nullable: false })
  RecoveryCode: string

  @Column({ nullable: false })
  Active: boolean

  @Column({ nullable: false })
  Active1: boolean

  @JoinColumn({name: "Email"})
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}
