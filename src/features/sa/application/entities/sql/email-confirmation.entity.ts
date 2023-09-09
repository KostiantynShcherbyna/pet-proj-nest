import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class EmailConfirmationEntity {

  @PrimaryGeneratedColumn("uuid")
  EmailConfirmationId: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  IsConfirmed: boolean

  // @Column({ type: "uuid", nullable: true })
  @Column({ nullable: true })
  ConfirmationCode: string | null

  @Column({ nullable: true })
  ExpirationDate: string | null

  @JoinColumn({ name: "UserId" })
  @ManyToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}