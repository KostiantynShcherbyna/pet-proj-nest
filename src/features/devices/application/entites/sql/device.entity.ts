import { Prop } from "@nestjs/mongoose"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { AccountEntity } from "../../../../sa/application/entities/sql/account.entity"

@Entity()
export class DeviceEntity {

  @PrimaryGeneratedColumn("uuid")
  DeviceId: string

  @Column({ type: "uuid", nullable: false })
  UserId: string

  @Column({ nullable: false })
  Ip: string

  @Column({ nullable: false })
  Title: string

  @Column({ nullable: false })
  LastActiveDate: string

  @Column({ nullable: false })
  ExpireAt: string

  @JoinColumn({ name: "UserId" })
  @ManyToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}
