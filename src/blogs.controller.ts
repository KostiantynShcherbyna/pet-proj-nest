import { Body, Controller, Delete, Get, Post, Put, Query, Param } from '@nestjs/common';
import { BlogsService } from './services/blogs.service';
import { BlogsQueryRepository } from './repositories/query/blogsQuery.repository';
import { bodyBlogModel } from './models/body/bodyBlogModel';
import { queryBlogModel } from './models/query/queryBlogModel';

@Controller("blogs")
export class BlogsController {
  constructor(
    protected BlogsService: BlogsService,
    protected BlogsQueryRepository: BlogsQueryRepository,
  ) { }

  @Get()
  async findBlogs(@Query() queryBlogModel: queryBlogModel) {
    return await this.BlogsQueryRepository.findBlogsView(queryBlogModel);
  }

  @Get(':id')
  async findBlog(@Param('id') id: string,) {
    const foundBlog = await this.BlogsQueryRepository.findBlogView(id)
    return foundBlog
  }

  @Post()
  async createBlog(@Body() bodyBlogModel: bodyBlogModel) {
    return await this.BlogsService.createBlog(bodyBlogModel);
  }

}
