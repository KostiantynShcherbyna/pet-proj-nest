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
import { RequestAttempts, RequestAttemptsModel } from "../schemas/request-attempts.schema"
import { RecoveryCodes, RecoveryCodesModel } from "../schemas/recovery-code.schema"

@Controller("testing")
export class TestingController {
  constructor(
    protected BlogsModel: BlogsModel,
    protected PostsModel: PostsModel,
    protected CommentsModel: CommentsModel,
    protected UsersModel: UsersModel,
    protected DevicesModel: DevicesModel,
    protected AttemptRequestsModel: RequestAttemptsModel,
    protected RecoveryCodesModel: RecoveryCodesModel
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
