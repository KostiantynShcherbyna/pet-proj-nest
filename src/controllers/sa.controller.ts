import {
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
import { BasicGuard } from "src/guards/basic.guard"
import { BodyBlogBanInputModel } from "src/input-models/body/body-blog-ban.input-model"
import { BodyUserBanInputModel } from "src/input-models/body/body-user-ban.input-model"
import { BodyUserInputModel } from "src/input-models/body/body-user.input-model"
import { QueryBlogsInputModel } from "src/input-models/query/query-blogs.input-model"
import { QueryUserSAInputModel } from "src/input-models/query/query-users-sa.input-model"
import { IdBlogBanInputModel } from "src/input-models/uri/id-blog-ban.input-model"
import { BindInputModel } from "src/input-models/uri/userId.input-model"
import { BlogsQueryRepository } from "src/repositories/query/blogs.query.repository"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { UsersService } from "src/services/users.service"
import { BanBlogCommand } from "src/use-cases/sa/ban-blog.use-case"
import { BindBlogCommand } from "src/use-cases/sa/bind-blog.use-case"
import { BanUserCommand } from "src/use-cases/sa/ban-user.use-case"
import { CreateUserCommand } from "src/use-cases/users/create-user.use-case"
import { DeleteUserCommand } from "src/use-cases/sa/delete-user.use-case"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { IdInputModel } from "../input-models/uri/id.input-model"

@Controller("sa")
export class SAController {
  constructor(
    private commandBus: CommandBus,
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }


  @UseGuards(BasicGuard)
  @Put("blogs/:id/ban")
  async banBlog(
    @Param() param: IdBlogBanInputModel,
    @Body() bodyBlogBan: BodyBlogBanInputModel,
  ) {
    const banContract = await this.commandBus.execute(
      new BanBlogCommand(
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
  async bindBlog(
    @Param() param: BindInputModel,
  ) {
    const foundBlogView = await this.commandBus.execute(
      new BindBlogCommand(
        param.id,
        param.userId
      )
    )
    if (foundBlogView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return
  }


  @UseGuards(BasicGuard)
  @Get("blogs")
  async getBlogs(
    @Query() queryBlog: QueryBlogsInputModel
  ) {
    return await this.blogsQueryRepository.findSABlogs(queryBlog)
  }





  @UseGuards(BasicGuard)
  @Put("users/:id/ban")
  async banUser(
    @Param() param: IdInputModel,
    @Body() bodyUserBan: BodyUserBanInputModel
  ) {
    const banContract = await this.commandBus.execute(
      new BanUserCommand(
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
    return await this.usersQueryRepository.findUsers(queryUser)
  }


  @UseGuards(BasicGuard)
  @Post("users")
  async createUser(
    @Body() bodyUser: BodyUserInputModel
  ) {
    return await this.commandBus.execute(
      new CreateUserCommand(
        bodyUser.login,
        bodyUser.email,
        bodyUser.password
      )
    )
  }


  @UseGuards(BasicGuard)
  @Delete("users/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param() param: IdInputModel
  ) {
    const resultContruct = await this.commandBus.execute(
      new DeleteUserCommand(param.id)
    )
    if (resultContruct.error === ErrorEnums.USER_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETED, "id")
    )
    return
  }





}
