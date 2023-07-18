import {
  Controller,
  Delete,
  HttpCode, HttpStatus,
  ServiceUnavailableException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { Devices, DevicesModel } from "../schemas/devices.schema"
import { RequestAttempts, RequestAttemptsModel } from "../schemas/requestAttempts.schema"
import { RecoveryCodes, RecoveryCodesModel } from "../schemas/recoveryCode.schema"

@Controller("testing")
export class TestingController {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    @InjectModel(RequestAttempts.name) protected AttemptRequestsModel: RequestAttemptsModel,
    @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel
  ) {
  }

  @Delete("all-data")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    try {
      await Promise.all(
        [
          await this.BlogsModel.deleteMany({}),
          await this.PostsModel.deleteMany({}),
          await this.CommentsModel.deleteMany({}),
          await this.UsersModel.deleteMany({}),
          await this.DevicesModel.deleteMany({}),
          await this.AttemptRequestsModel.deleteMany({}),
          await this.RecoveryCodesModel.deleteMany({})
        ]
      )
      return
    } catch {
      throw new ServiceUnavailableException()
    }
  }
}
