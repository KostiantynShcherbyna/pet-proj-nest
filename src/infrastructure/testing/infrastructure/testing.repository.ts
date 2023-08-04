import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Users, UsersDocument, UsersModel } from "../../../features/super-admin/application/entity/users.schema"
import { UserBodyInputModel } from "../api/models/input/user.body.input-model"

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
  ) {
  }

  async getUser(bodyUser: UserBodyInputModel): Promise<null | UsersDocument> {


    const searchDto = {
      login: bodyUser.loginOrEmail,
      email: bodyUser.loginOrEmail
    }

    const foundUser = await this.UsersModel.findOne({
      $or: [
        { "accountData.email": searchDto.email },
        { "accountData.login": searchDto.login },
      ]
    })
    if (foundUser === null) {
      return null
    }

    return foundUser
  }

}
