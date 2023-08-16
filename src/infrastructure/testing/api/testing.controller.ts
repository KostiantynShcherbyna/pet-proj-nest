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
import { Devices, DevicesModel } from "../../../features/devices/application/entites/mongoose/devices.schema"
import {
  RecoveryCodes,
  RecoveryCodesModel
} from "../../../features/auth/application/entities/mongoose/recovery-code.schema"
import {
  RequestAttempts,
  RequestAttemptsModel
} from "../../../features/auth/application/entities/mongoose/request-attempts.schema"
import { Blogs, BlogsModel } from "../../../features/blogger/application/entities/mongoose/blogs.schema"
import { Comments, CommentsModel } from "../../../features/comments/application/entities/mongoose/comments.schema"
import { Posts, PostsModel } from "../../../features/blogger/application/entities/mongoose/posts.schema"
import { Users, UsersModel } from "../../../features/super-admin/application/entities/mongoose/users.schema"
import {
  BannedBlogUsers,
  BannedBlogUsersModel
} from "../../../features/blogger/application/entities/mongoose/banned-blog-users.schema"
import {
  PostsComments,
  PostsCommentsModel
} from "../../../features/blogger/application/entities/mongoose/posts-comments.schema"
import { TestingRepository } from "../infrastructure/testing.repository"
import { UserBodyInputModel } from "./models/input/user.body.input-model"
import { callErrorMessage } from "../../adapters/exception-message.adapter"
import { ErrorEnums } from "../../utils/error-enums"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"


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
    @InjectDataSource() protected dataSource: DataSource,
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
          await this.dataSource.query(`delete from auth."RecoveryCodes"`),
          await this.dataSource.query(`delete from devices."Devices"`),
          await this.dataSource.query(`delete from users."SentConfirmationCodeDates"`),
          await this.dataSource.query(`delete from users."BanInfo"`),
          await this.dataSource.query(`delete from users."EmailConfirmation"`),
          await this.dataSource.query(`delete from users."AccountData"`),
          // await this.dataSource.query(`ALTER SEQUENCE users RESTART WITH 1`),
        ]
      )
      return
    } catch (err) {
      console.log(err)
      throw new ServiceUnavailableException()
    }
  }

  @Get("user")
  async getUser(
    @Body() bodyUser: UserBodyInputModel,
  ) {
    const user = await this.testingRepository.getUser(bodyUser)
    if (user === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "loginOrEmail")
    )
    return user
  }
}
