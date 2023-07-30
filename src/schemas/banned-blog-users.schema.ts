import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model, Types } from 'mongoose'
import { BannedBlogUsersRepository } from 'src/repositories/banned-blog-users.repository'
import { UsersRepository } from 'src/repositories/users.repository'


@Schema()
export class BannedBlogUsers {

  @Prop({
    type: String,
    required: true,
  })
  userId: string

  @Prop({
    type: String,
    required: true,
  })
  login: string

  @Prop({
    type: Boolean,
    required: true,
  })
  isBanned: Boolean

  @Prop({
    type: String,
    required: true,
  })
  banReason: string | null

  @Prop({
    type: String,
    required: true,
  })
  banDate: string | null

  @Prop({
    type: String,
    required: true,
  })
  blogId: string


  static async banUser(
    { userId, banReason, blogId, usersRepository, bannedBlogUsersRepository, BannedBlogUsersModel }:
      {
        userId: string, banReason: string, blogId: string, usersRepository: UsersRepository,
        bannedBlogUsersRepository: BannedBlogUsersRepository, BannedBlogUsersModel: BannedBlogUsersModel
      }
  ): Promise<null | BannedBlogUsersDocument> {

    const foundUserToBan = await usersRepository.findUser(["_id", new Types.ObjectId(userId)])
    if (foundUserToBan === null)
      return null

    const bannedBlogUserDocument = await bannedBlogUsersRepository.findBannedBlogUsers(userId, blogId)
    if (bannedBlogUserDocument === null)
      return new BannedBlogUsersModel({
        userId: userId,
        login: foundUserToBan.accountData.login,
        banReason: banReason,
        banDate: new Date().toISOString(),
        blogId: blogId
      })

    bannedBlogUserDocument.isBanned = true
    bannedBlogUserDocument.banReason = banReason
    bannedBlogUserDocument.banDate = new Date().toISOString()
    return bannedBlogUserDocument
  }


  static async unbanUser(
    userId: string, blogId: string, BannedBlogUsersRepository: BannedBlogUsersRepository
  ): Promise<null | BannedBlogUsersDocument> {

    const bannedBlogUserDocument = await BannedBlogUsersRepository.findBannedBlogUsers(userId, blogId)
    if (bannedBlogUserDocument === null)
      return null

    bannedBlogUserDocument.isBanned = false
    bannedBlogUserDocument.banReason = null
    bannedBlogUserDocument.banDate = null
    return bannedBlogUserDocument
  }

}
interface BannedBlogUsersStatics {
  banUser(
    { userId, banReason, blogId, usersRepository, bannedBlogUsersRepository, BannedBlogUsersModel }:
      {
        userId: string, banReason: string, blogId: string, usersRepository: UsersRepository,
        bannedBlogUsersRepository: BannedBlogUsersRepository, BannedBlogUsersModel: BannedBlogUsersModel
      }
  ): Promise<BannedBlogUsersDocument>

  unbanUser(
    userId: string, blogId: string, BannedBlogUsersRepository: BannedBlogUsersRepository
  ): Promise<null | BannedBlogUsersDocument>
}

export const BannedBlogUsersSchema = SchemaFactory.createForClass(BannedBlogUsers)

export type BannedBlogUsersDocument = HydratedDocument<BannedBlogUsers>
export type BannedBlogUsersModel = Model<BannedBlogUsersDocument> & BannedBlogUsersStatics
