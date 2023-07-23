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
    @Query() queryUser: QueryUserInputModel
  ) {
    return await this.usersQueryRepository.findUsers(queryUser)
  }

  @UseGuards(BasicGuard)
  @Post()
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
  @Delete(":id")
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
}
