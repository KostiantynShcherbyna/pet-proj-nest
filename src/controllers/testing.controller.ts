import {
  Controller,
  Delete,
  HttpCode, HttpStatus,
  ServiceUnavailableException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Blogs, BlogsModel } from "src/schemas/blogs.schema"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
import { Posts, PostsModel } from "src/schemas/posts.schema"
import { Users, UsersModel } from "src/schemas/users.schema"
import { Devices, DevicesModel } from "../schemas/devices.schema"
import { RecoveryCodes, RecoveryCodesModel } from "../schemas/recovery-code.schema"
import { RequestAttempts, RequestAttemptsModel } from "../schemas/request-attempts.schema"
import { BannedBlogUsers, BannedBlogUsersModel } from "src/schemas/banned-blog-users.schema"
import { PostsComments, PostsCommentsModel } from "src/schemas/posts-comments.schema"

@Controller("testing")
export class TestingController {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    @InjectModel(Devices.name) protected DevicesModel: DevicesModel,
    @InjectModel(RequestAttempts.name) protected AttemptRequestsModel: RequestAttemptsModel,
    @InjectModel(RecoveryCodes.name) protected RecoveryCodesModel: RecoveryCodesModel,
    @InjectModel(BannedBlogUsers.name) protected BannedBlogUsersModel: BannedBlogUsersModel,
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel,
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
          await this.RecoveryCodesModel.deleteMany({}),
          await this.BannedBlogUsersModel.deleteMany({}),
          await this.PostsCommentsModel.deleteMany({}),
        ]
      )
      return
    } catch {
      throw new ServiceUnavailableException()
    }
  }
}
