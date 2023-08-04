import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Devices, DevicesModel } from "../../../features/auth/application/entitys/devices.schema"
import { RecoveryCodes, RecoveryCodesModel } from "../../../features/auth/application/entitys/recovery-code.schema"
import {
  RequestAttempts,
  RequestAttemptsModel
} from "../../../features/auth/application/entitys/request-attempts.schema"
import { Blogs, BlogsModel } from "../../../features/blogger/application/entity/blogs.schema"
import { Comments, CommentsModel } from "../../../features/comments/application/entity/comments.schema"
import { Posts, PostsModel } from "../../../features/blogger/application/entity/posts.schema"
import { Users, UsersModel } from "../../../features/super-admin/application/entity/users.schema"
import {
  BannedBlogUsers,
  BannedBlogUsersModel
} from "../../../features/blogger/application/entity/banned-blog-users.schema"
import { PostsComments, PostsCommentsModel } from "../../../features/comments/application/entity/posts-comments.schema"
import { TestingRepository } from "../infrastructure/testing.repository"
import { UserBodyInputModel } from "./models/input/user.body.input-model"
import { callErrorMessage } from "../../adapters/exception-message.adapter"
import { ErrorEnums } from "../../utils/error-enums"


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
    protected testingRepository: TestingRepository,
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

  @Get("user")
  async getUser(
    @Body() bodyUser: UserBodyInputModel,
  ) {
    console.log("bodyUser-contr-before = " + bodyUser)
    const user = await this.testingRepository.getUser(bodyUser)
    console.log("user-contr-after = " + user)
    if (user === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "loginOrEmail")
    )
  }
}
