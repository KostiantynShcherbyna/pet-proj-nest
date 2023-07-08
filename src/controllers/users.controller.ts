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
  Inject,
} from '@nestjs/common';
import { QueryUserModel } from 'src/models/query/QueryUserModel';
import { UsersQueryRepository } from 'src/repositories/query/users.query.repository';
import { BodyUserModel } from 'src/models/body/BodyUserModel';
import { UsersService } from 'src/services/users.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersQueryRepository)
    protected UsersQueryRepository: UsersQueryRepository,
    @Inject(UsersService) protected UsersService: UsersService,
  ) {}

  @Get()
  async findUsers(@Query() queryUser: QueryUserModel) {
    return await this.UsersQueryRepository.findUsers(queryUser);
  }

  @Post()
  async createUser(@Body() bodyUser: BodyUserModel) {
    return await this.UsersService.createUser(bodyUser);
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param() id: string) {
    const result = await this.UsersService.deleteUser(id);
    if (result.error !== null) throw new NotFoundException();
    return;
  }
}
