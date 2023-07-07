import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject } from '@nestjs/common';
import { BlogsService } from '../services/blogs.service';
import { BlogsQueryRepository } from '../repositories/query/blogsQuery.repository';
import { bodyBlogModel } from '../models/body/bodyBlogModel';
import { queryBlogModel } from '../models/query/queryBlogModel';
import { PostsQueryRepository } from 'src/repositories/query/postsQuery.repository';
import { queryPostModel } from 'src/models/query/queryPostModel';
import { bodyBlogPostModel } from 'src/models/body/bodyBlogPostModel';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(BlogsService) protected BlogsService: BlogsService,
    @Inject(BlogsQueryRepository) protected BlogsQueryRepository: BlogsQueryRepository,
    @Inject(PostsQueryRepository) protected PostsQueryRepository: PostsQueryRepository,
  ) { }

  @Get()
  async findBlogs(
    @Query() queryBlog: queryBlogModel,
  ) {
    return await this.BlogsQueryRepository.findBlogsView(queryBlog)
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
    @Body() bodyBlog: bodyBlogModel,
  ) {
    return await this.BlogsService.createBlog(bodyBlog)
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param() id: string,
    @Body() bodyBlog: bodyBlogModel,
  ) {
    const result = await this.BlogsService.updateBlog(id, bodyBlog)
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(
    @Param() id: string,
  ) {
    const result = await this.BlogsService.deleteBlog(id);
    if (result.error !== null) throw new NotFoundException()
    return
  }




  @Get(':blogId/posts')
  async findPosts(
    @Param('blogId') blogId: string,
    @Query() queryPost: queryPostModel
  ) {
    const foundPostsView = await this.PostsQueryRepository.findPosts(queryPost, blogId)
    if (foundPostsView === null) throw new NotFoundException()
    return foundPostsView
  }

  @Post(':blogId/posts')
  async createPost(
    @Param('blogId') blogId: string,
    @Body() bodyBlogPost: bodyBlogPostModel,
  ) {
    const result = await this.BlogsService.createPost(bodyBlogPost, blogId);
    if (result.error !== null) throw new NotFoundException()
    return result.data
  }
}
