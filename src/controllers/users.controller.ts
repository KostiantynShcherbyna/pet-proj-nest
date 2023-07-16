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
import { QueryUserModel } from "src/models/query/QueryUserModel"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { BodyUserModel } from "src/models/body/BodyUserModel"
import { UsersService } from "src/services/users.service"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"
import { ErrorEnums } from "src/utils/errors/errorEnums"
import { callErrorMessage } from "src/utils/errors/callErrorMessage"
import { BasicGuard } from "src/guards/basic.guard"

@Controller("users")
export class UsersController {
  constructor(
    @Inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository,
    @Inject(UsersService) protected usersService: UsersService
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
    return await this.usersService.createUser(bodyUser)
  }

  @UseGuards(BasicGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() params: ObjectIdIdModel
  ) {
    const resultContruct = await this.usersService.deleteUser(params.id)
    if (resultContruct.error === ErrorEnums.USER_NOT_DELETE) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETE, "id")
    )
    return
  }
}
