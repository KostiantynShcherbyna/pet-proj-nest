import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject } from '@nestjs/common';
import { BlogsService } from '../services/blogs.service';
import { BlogsQueryRepository } from '../repositories/query/blogsQuery.repository';
import { bodyBlogModel } from '../models/body/bodyBlogModel';
import { queryBlogModel } from '../models/query/queryBlogModel';
import { PostsQueryRepository } from 'src/repositories/query/postsQuery.repository';
import { queryPostModel } from 'src/models/query/queryPostModel';
import { bodyBlogPostModel } from 'src/models/body/bodyBlogPostModel';
import { bodyAuthModel } from 'src/models/body/bodyAuthModel';

@Controller('auth')
export class AuthController {
  constructor(

  ) { }

  @Post()
  async login(
    @Body() bodyAuthModel: bodyAuthModel,
  ) {
    return await this.BlogsService.createBlog(bodyBlogModel)
  }

}
