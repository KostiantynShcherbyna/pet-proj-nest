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
import { GetBlogsQueryInputModel } from "./models/input/blogs/get-blogs.query.input-model"
import { IdParamInputModel } from "./models/input/id.param.input-model"
import { UsersQueryRepository } from "../repository/mongoose/users.query.repository"
import { BlogsQueryRepository } from "../../blogs/repository/mongoose/blogs.query.repository"
import { BasicGuard } from "../../../infrastructure/guards/basic.guard"
import { BanBlogParamInputModel } from "./models/input/blogs/ban-blog.param.input-model"
import { BanBlogBodyInputModel } from "./models/input/blogs/ban-blog.body.input-model"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { BanBlogCommand } from "../application/use-cases/mongoose/ban-blog.use-case"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { BindInputModel } from "./models/input/blogs/bind-blog.param.input-model"
import { BindBlogCommand } from "../application/use-cases/mongoose/bind-blog.use-case"
import { BanUserBodyInputModel } from "./models/input/users/ban-user.body.input-model"
import { BanUserCommand } from "../application/use-cases/mongoose/ban-user.use-case"
import { QueryUserSAInputModel } from "./models/input/users/get-users.query.input-model"
import { CreateUserBodyInputModel } from "./models/input/users/create-user.body.input-model"
import { CreateUserCommand } from "../application/use-cases/mongoose/create-user.use-case"
import { DeleteUserCommand } from "../application/use-cases/mongoose/delete-user.use-case"

@Controller("ssa")
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
    const foundBlogContract = await this.commandBus.execute(
      new BindBlogCommand(
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
    return await this.blogsQueryRepository.findSABlogs(queryBlog)
  }


  // USERS ↓↓↓
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
    const resultContract = await this.commandBus.execute(
      new DeleteUserCommand(param.id)
    )
    if (resultContract.error === ErrorEnums.USER_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETED, "id")
    )
    return
  }


}
