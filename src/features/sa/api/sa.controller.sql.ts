import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { GetBlogsQueryInputModel } from "./models/input/get-blogs.query.input-model"
import { BlogsQueryRepository } from "../../blogs/repository/mongoose/blogs.query.repository"
import { BasicGuard } from "../../../infrastructure/guards/basic.guard"
import { BanBlogParamInputModel } from "./models/input/ban-blog.param.input-model"
import { BanBlogBodyInputModel } from "./models/input/ban-blog.body.input-model"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { BanBlogCommand } from "../application/use-cases/mongoose/ban-blog.use-case"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { BindInputModel } from "./models/input/bind-blog.param.input-model"
import { BindBlogCommand } from "../application/use-cases/mongoose/bind-blog.use-case"
import { BanUserBodyInputModel } from "./models/input/ban-user.body.input-model"
import { QueryUserSAInputModel } from "./models/input/get-users.query.input-model"
import { CreateUserBodyInputModel } from "./models/input/create-user.body.input-model"
import { BanUserCommandSql } from "../application/use-cases/sql/ban-user.use-case.sql"
import { CreateUserSqlCommand } from "../application/use-cases/sql/create-user.use-case.sql"
import { UsersQueryRepositorySql } from "../repository/sql/users.query.repository.sql"
import { DeleteUserCommandSql } from "../application/use-cases/sql/delete-user.use-case.sql"
import { IdSqlParamInputModel } from "./models/input/id.sql.param.input-model"
import { BanBlogCommandSql } from "../application/use-cases/sql/ban-blog.use-case.sql"
import { BindBlogCommandSql } from "../application/use-cases/sql/bind-blog.use-case.sql"
import { BlogsQueryRepositoryOrm } from "../../blogs/repository/orm/blogs.query.repository.orm"
import { BanBlogParamInputModelSql } from "./models/input/ban-blog.param.input-model.sql"

@Controller("sa")
export class SaControllerSql {
  constructor(
    private commandBus: CommandBus,
    protected usersSqlQueryRepository: UsersQueryRepositorySql,
    protected blogsQueryRepositorySql: BlogsQueryRepositoryOrm,
  ) {
  }


  @UseGuards(BasicGuard)
  @Put("blogs/:id/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param() param: BanBlogParamInputModelSql,
    @Body() bodyBlogBan: BanBlogBodyInputModel,
  ) {
    const banContract = await this.commandBus.execute(
      new BanBlogCommandSql(
        param.id,
        bodyBlogBan.isBanned,
      )
    )
    if (banContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return
  }


  @UseGuards(BasicGuard)
  @Put("blogs/:id/bind-with-user/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlog(
    @Param() param: BindInputModel,
  ) {
    const foundBlogContract = await this.commandBus.execute(
      new BindBlogCommandSql(
        param.id,
        param.userId
      )
    )
    if (foundBlogContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (foundBlogContract.error === ErrorEnums.BLOG_ALREADY_BOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.BLOG_ALREADY_BOUND, "id")
    )
    return
  }


  @UseGuards(BasicGuard)
  @Get("blogs")
  async getBlogs(
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    return await this.blogsQueryRepositorySql.findBlogsSA(queryBlog)
  }


  // USERS ↓↓↓
  @UseGuards(BasicGuard)
  @Put("users/:id/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param() param: IdSqlParamInputModel,
    @Body() bodyUserBan: BanUserBodyInputModel
  ) {
    const banContract = await this.commandBus.execute(
      new BanUserCommandSql(
        param.id,
        bodyUserBan.isBanned,
        bodyUserBan.banReason,
      )
    )
    if (banContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
    )
    if (banContract.error === ErrorEnums.USER_NOT_BANNED) throw new InternalServerErrorException()
    return
  }

  @UseGuards(BasicGuard)
  @Get("users")
  async getUsers(
    @Query() queryUser: QueryUserSAInputModel
  ) {
    return await this.usersSqlQueryRepository.findUsers(queryUser)
  }


  @UseGuards(BasicGuard)
  @Post("users")
  async createUser(
    @Body() bodyUser: CreateUserBodyInputModel
  ) {
    const createResult = await this.commandBus.execute(
      new CreateUserSqlCommand(
        bodyUser.login,
        bodyUser.email,
        bodyUser.password
      )
    )
    if (createResult.error === ErrorEnums.USER_EMAIL_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_EXIST, bodyUser.email)
    )
    if (createResult.error === ErrorEnums.USER_LOGIN_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_LOGIN_EXIST, bodyUser.login)
    )
    const userView = await this.usersSqlQueryRepository.findUsersByUserId(createResult.data)
    if (userView === null) throw new NotFoundException()
    return userView
  }


  @UseGuards(BasicGuard)
  @Delete("users/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param() param: IdSqlParamInputModel
  ) {
    const resultContract = await this.commandBus.execute(
      new DeleteUserCommandSql(param.id)
    )
    if (resultContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
    )
    if (resultContract.error === ErrorEnums.USER_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETED, "id")
    )
    return
  }


}
