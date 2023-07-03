import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode } from '@nestjs/common';
import { BlogsService } from './services/blogs.service';
import { BlogsQueryRepository } from './repositories/query/blogsQuery.repository';
import { bodyBlogModel } from './models/body/bodyBlogModel';
import { queryBlogModel } from './models/query/queryBlogModel';
import { idModel } from './models/uri/idModel';

@Controller("blogs")
export class BlogsController {
  constructor(
    protected BlogsService: BlogsService,
    protected BlogsQueryRepository: BlogsQueryRepository,
  ) { }

  @Get()
  async findBlogs(
    @Query() queryBlogModel: queryBlogModel,
  ) {
    return await this.BlogsQueryRepository.findBlogsView(queryBlogModel);
  }

  @Get(':id')
  async findBlog(
    @Param('id') id: string,
  ) {
    const foundBlogView = await this.BlogsQueryRepository.findBlogView(id)
    if (foundBlogView === null) throw new NotFoundException()
    return foundBlogView
  }

  @Post()
  async createBlog(
    @Body() bodyBlogModel: bodyBlogModel,
  ) {
    return await this.BlogsService.createBlog(bodyBlogModel);
  }

  @Put()
  @HttpCode(204)
  async updateBlog(
    @Param() id: string,
    @Body() bodyBlogModel: bodyBlogModel,
  ) {
    const result = await this.BlogsService.updateBlog(id, bodyBlogModel);
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @Delete()
  @HttpCode(204)
  async deleteBlog(
    @Param() id: string,
  ) {
    const result = await this.BlogsService.deleteBlog(id);
    if (result.error !== null) throw new NotFoundException()
    return
  }

}
