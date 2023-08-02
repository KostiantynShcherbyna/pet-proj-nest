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
import { BasicGuard } from "src/infrastructure/guards/basic.guard"
import { BanBlogBodyInputModel } from "src/features/super-admin/api/models/input/ban-blog.body.input-model"
import { BanUserBodyInputModel } from "src/features/super-admin/api/models/input/ban-user.body.input-model"
import { CreateUserBodyInputModel } from "src/features/users/api/models/input/create-user.body.input-model"
import { GetBlogsQueryInputModel } from "src/features/blogger/api/models/input/get-blogs.query.input-model"
import { QueryUserSAInputModel } from "src/features/super-admin/api/models/input/get-users.query.input-model"
import { BanBlogParamInputModel } from "src/features/super-admin/api/models/input/ban-blog.param.input-model"
import { BindInputModel } from "src/features/super-admin/api/models/input/bind-blog.param.input-model"
import { BlogsQueryRepository } from "src/features/blogs/infrastructure/blogs.query.repository"
import { UsersQueryRepository } from "src/features/users/infrastructure/users.query.repository"
import { BanBlogCommand } from "src/features/super-admin/application/ban-blog.use-case"
import { BindBlogCommand } from "src/features/super-admin/application/bind-blog.use-case"
import { BanUserCommand } from "src/features/super-admin/application/ban-user.use-case"
import { CreateUserCommand } from "src/features/users/application/create-user.use-case"
import { DeleteUserCommand } from "src/features/super-admin/application/delete-user.use-case"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"
import { callErrorMessage } from "src/infrastructure/adapters/exception-message.adapter"
import { IdParamInputModel } from "../../blogger/api/models/input/id.param.input-model"

@Controller("sa")
export class SAController {
  constructor(
    private commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }


  @UseGuards(BasicGuard)
  @Put("blogs/:id/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(
    @Param() param: BanBlogParamInputModel,
    @Body() bodyBlogBan: BanBlogBodyInputModel,
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
  @HttpCode(HttpStatus.NO_CONTENT)
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
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    return await this.blogsQueryRepository.findSABlogs(queryBlog)
  }


  @UseGuards(BasicGuard)
  @Put("users/:id/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param() param: IdParamInputModel,
    @Body() bodyUserBan: BanUserBodyInputModel
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
    @Body() bodyUser: CreateUserBodyInputModel
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
    @Param() param: IdParamInputModel
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
