import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Param,
  NotFoundException,
  HttpCode,
  Inject, HttpStatus, UseGuards
} from "@nestjs/common"
import { QueryUserModel } from "src/models/query/query-user.model"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { BodyUserModel } from "src/models/body/body-user.model"
import { UsersService } from "src/services/users.service"
import { ObjectIdIdModel } from "../models/uri/id.model"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { BasicGuard } from "src/guards/basic.guard"
import { CreateUserCommand } from "src/services/use-cases/users/create-user.use-case"
import { DeletePostCommand } from "src/services/use-cases/posts/delete-post.use-case"
import { DeleteUserCommand } from "src/services/use-cases/users/delete-user.use-case"
import { CommandBus } from "@nestjs/cqrs"

@Controller("users")
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
    protected usersService: UsersService
  ) {
  }

  @Get()
  async findUsers(
    @Query() queryUser: QueryUserModel
  ) {
    return await this.usersQueryRepository.findUsers(queryUser)
  }

  @UseGuards(BasicGuard)
  @Post()
  async createUser(
    @Body() bodyUser: BodyUserModel
  ) {
    return await this.commandBus.execute(
      new CreateUserCommand(bodyUser)
    )
  }

  @UseGuards(BasicGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param() param: ObjectIdIdModel
  ) {
    const resultContruct = await this.commandBus.execute(
      new DeleteUserCommand(param.id)
    )
    if (resultContruct.error === ErrorEnums.USER_NOT_DELETE) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETE, "id")
    )
    return
  }
}
