import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model, Types } from 'mongoose'
import { BannedBlogUsersRepository } from 'src/repositories/bloggers/mongoose/banned-blog-users.repository'
import { UsersRepository } from 'src/repositories/users/mongoose/users.repository'


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
    { userId, banReason, blogId, usersRepository, BannedBlogUsersModel }:
      {
        userId: string, banReason: string, blogId: string, usersRepository: UsersRepository,
        BannedBlogUsersModel: BannedBlogUsersModel
      }
  ): Promise<null | BannedBlogUsersDocument> {

    const foundUserToBan = await usersRepository.findUser(["_id", new Types.ObjectId(userId)])
    if (foundUserToBan === null)
      return null

    const newBannedBlogUser = new BannedBlogUsersModel(
      {
        userId: foundUserToBan._id.toString(),
        login: foundUserToBan.accountData.login,
        isBanned: true,
        banReason: banReason,
        banDate: new Date().toISOString(),
        blogId: blogId,
      }
    )

    return newBannedBlogUser
  }


  static async unbanUser(
    userId: string, blogId: string, BannedBlogUsersRepository: BannedBlogUsersRepository
  ): Promise<null | BannedBlogUsersDocument> {

    const bannedBlogUser = await BannedBlogUsersRepository.findBannedBlogUser(userId, blogId)
    if (bannedBlogUser === null)
      return null

    bannedBlogUser.isBanned = false
    bannedBlogUser.banReason = null
    bannedBlogUser.banDate = null
    return bannedBlogUser
  }

}
interface BannedBlogUsersStatics {
  banUser(
    { userId, banReason, blogId, usersRepository, BannedBlogUsersModel }:
      {
        userId: string, banReason: string, blogId: string, usersRepository: UsersRepository,
        BannedBlogUsersModel: BannedBlogUsersModel
      }
  ): Promise<BannedBlogUsersDocument>

  unbanUser(
    userId: string, blogId: string, BannedBlogUsersRepository: BannedBlogUsersRepository
  ): Promise<null | BannedBlogUsersDocument>
}

export const BannedBlogUsersSchema = SchemaFactory.createForClass(BannedBlogUsers)
BannedBlogUsersSchema.statics.banUser = BannedBlogUsers.banUser
BannedBlogUsersSchema.statics.unbanUser = BannedBlogUsers.unbanUser

export type BannedBlogUsersDocument = HydratedDocument<BannedBlogUsers>
export type BannedBlogUsersModel = Model<BannedBlogUsersDocument> & BannedBlogUsersStatics
