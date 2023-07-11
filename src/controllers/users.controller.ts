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
  Inject, HttpStatus
} from "@nestjs/common"
import { QueryUserModel } from "src/models/query/QueryUserModel"
import { UsersQueryRepository } from "src/repositories/query/users.query.repository"
import { BodyUserModel } from "src/models/body/BodyUserModel"
import { UsersService } from "src/services/users.service"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"

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

  @Post()
  async createUser(
    @Body() bodyUser: BodyUserModel
  ) {
    return await this.usersService.createUser(bodyUser)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() id: ObjectIdIdModel
  ) {
    const result = await this.usersService.deleteUser(id.id)
    if (result.error !== null) throw new NotFoundException()
    return
  }
}
