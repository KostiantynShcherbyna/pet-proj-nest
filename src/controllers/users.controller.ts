import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject } from '@nestjs/common';
import { queryUserModel } from 'src/models/query/queryUserModel';
import { UsersQueryRepository } from 'src/repositories/query/usersQuery.repository';
import { bodyUserModel } from 'src/models/body/bodyUserModel';
import { UsersService } from 'src/services/users.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersQueryRepository) protected UsersQueryRepository: UsersQueryRepository,
    @Inject(UsersService) protected UsersService: UsersService,
  ) { }

  @Get()
  async findUsers(
    @Query() queryUserModel: queryUserModel,
  ) {
    return await this.UsersQueryRepository.findUsers(queryUserModel)
  }

  @Post()
  async createUser(
    @Body() bodyUserModel: bodyUserModel,
  ) {
    return await this.UsersService.createUser(bodyUserModel);
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(
    @Param() id: string,
  ) {
    const result = await this.UsersService.deleteUser(id);
    if (result.error !== null) throw new NotFoundException()
    return
  }

}
