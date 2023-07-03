import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { BlogsService } from './services/blogs.service';

@Controller("blogs")
export class BlogsController {
  constructor(
    private readonly BlogsService: BlogsService
  ) { }

  @Get()
  findBlogs(@Query() dto) {
    return this.BlogsService.createBlog(dto);
  }

  @Get()
  findBlog(@Query() dto) {
    return this.BlogsService.createBlog(dto);
  }

  @Get()
  findBlogPosts(@Query() dto) {
    return this.BlogsService.createBlog(dto);
  }

  @Post()
  createBlog(@Body() dto) {
    return this.BlogsService.createBlog(dto);
  }

  @Post()
  createPost(@Body() dto) {
    return this.BlogsService.createBlog(dto);
  }

  @Put()
  updateBlog(@Body() dto) {
    return this.BlogsService.createBlog(dto);
  }

  @Delete()
  deleteBlog(@Body() dto) {
    return this.BlogsService.createBlog(dto);
  }


}
