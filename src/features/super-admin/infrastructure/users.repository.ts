import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Users, UsersDocument, UsersModel } from "../application/entity/users.schema"

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
  ) {
  }


  async findUser(searchData: any) {

    const user = await this.UsersModel.findOne({ [searchData[0]]: searchData[1] })
    if (user === null) return null

    return user
  }

  async findBannedUsers() {
    const bannedUsers = await this.UsersModel.find({ "accountData.banInfo.isBanned": true })
    return bannedUsers
  }

  // async findBannedUser(userId: string) {
  //     const bannedUsers = await this.UsersModel.find({ "accountData.banInfo.isBanned": true }, { _id: 1 }).lean()
  //     return bannedUsers
  // }


  async findUserLoginOrEmail(userAuthData: { login: string, email: string }) {

    const foundUser = await this.UsersModel.findOne({
      $or: [
        { "accountData.email": userAuthData.email },
        { "accountData.login": userAuthData.login },
      ]
    })
    if (foundUser === null) {
      return null
    }

    return foundUser
  }


  async saveDocument(document: UsersDocument) {
    await document.save()
  }

}
