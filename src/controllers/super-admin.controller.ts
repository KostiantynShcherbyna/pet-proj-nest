import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { BasicGuard } from "src/guards/basic.guard"
import { BodyUserInputModel } from "src/input-models/body/body-user.input-model"
import { QueryUserInputModel } from "src/input-models/query/query-user.input-model"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { CreateUserCommand } from "src/services/use-cases/users/create-user.use-case"
import { DeleteUserCommand } from "src/services/use-cases/users/delete-user.use-case"
import { UsersService } from "src/services/users.service"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { IdInputModel } from "../input-models/uri/id.input-model"
import { BanUserCommand } from "src/services/use-cases/users/ban-user.use-case"
import { BodyUserBanInputModel } from "src/input-models/body/body-user-ban.input-model"
import { QueryUserSAInputModel } from "src/input-models/query/query-user-sa.input-model"
import { BlogsQueryRepository } from "src/repositories/query/blogs.query.repository"
import { QueryBlogInputModel } from "src/input-models/query/query-blog.input-model"
import { BindInputModel } from "src/input-models/uri/userId.input-model"
import { BindBlogCommand } from "src/services/use-cases/blogger/bind-blog.use-case"

@Controller("sa")
export class SuperAdminController {
  constructor(
    private commandBus: CommandBus,
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }


  @UseGuards(BasicGuard)
  @Put("/users/:id/ban")
  async banUser(
    @Param() param: IdInputModel,
    @Body() bodyUserBan: BodyUserBanInputModel
  ) {
    return await this.commandBus.execute(
      new BanUserCommand(
        param.id,
        bodyUserBan.isBanned,
        bodyUserBan.banReason,
      )
    )
  }

  @UseGuards(BasicGuard)
  @Get("/users")
  async findUsers(
    @Query() queryUser: QueryUserSAInputModel
  ) {
    return await this.usersQueryRepository.findUsers(queryUser)
  }


  @UseGuards(BasicGuard)
  @Post("/users")
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
  @Delete("/users/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param() param: IdInputModel
  ) {
    const resultContruct = await this.commandBus.execute(
      new DeleteUserCommand(param.id)
    )
    if (resultContruct.error === ErrorEnums.USER_NOT_DELETE) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETE, "id")
    )
    return
  }



  
  @UseGuards(BasicGuard)
  @Put("/blogs/:id/bind-with-user/:userId")
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
    return foundBlogView
  }


  @UseGuards(BasicGuard)
  @Get()
  async findBlogs(
    @Query() queryBlog: QueryBlogInputModel
  ) {
    return await this.blogsQueryRepository.findBlogs(queryBlog)
  }


}
