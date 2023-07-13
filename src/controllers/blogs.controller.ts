import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Param,
  NotFoundException,
  HttpCode,
  Inject, Req, UseGuards, HttpStatus
} from "@nestjs/common"
import { BlogsService } from "../services/blogs.service"
import { BlogsQueryRepository } from "../repositories/query/blogs.query.repository"
import { BodyBlogModel } from "../models/body/BodyBlogModel"
import { QueryBlogModel } from "../models/query/QueryBlogModel"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { QueryPostModel } from "src/models/query/QueryPostModel"
import { BodyBlogPostModel } from "src/models/body/BodyBlogPostModel"
import ValidateObjectIdPipe from "src/objectId-parser.pipe"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"
import { ObjectIdBlogIdModel } from "../models/uri/ObjectId-blogId.model"
import { DeviceSessionModel } from "../models/request/device-session.model"
import { AccessMiddleware } from "../guards/access.middleware"
import { OptionalDeviceSessionModel } from "../models/request/optional-device-session.model"

@Controller("blogs")
export class BlogsController {
  constructor(
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository,
    @Inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
  ) {
  }

  @Get(":id")
  async findBlog(
    @Param() params: ObjectIdIdModel,
  ) {
    const foundBlogView = await this.blogsQueryRepository.findBlog(params.id)
    if (foundBlogView === null) throw new NotFoundException()
    return foundBlogView
  }

  @Get()
  async findBlogs(
    @Query() queryBlog: QueryBlogModel
  ) {
    return await this.blogsQueryRepository.findBlogs(queryBlog)
  }

  @Post()
  async createBlog(
    @Body() bodyBlog: BodyBlogModel
  ) {
    return await this.blogsService.createBlog(bodyBlog)
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: ObjectIdIdModel,
    @Body() bodyBlog: BodyBlogModel
  ) {
    console.log(params)
    const result = await this.blogsService.updateBlog(params.id, bodyBlog)
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param() params: ObjectIdIdModel
  ) {
    const result = await this.blogsService.deleteBlog(params.id)
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async findPosts(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param() params: ObjectIdBlogIdModel,
    @Query() queryPost: QueryPostModel,
  ) {
    const foundPostsView = await this.postsQueryRepository.findPosts(
      queryPost, params.blogId, deviceSession.userId
    )
    if (foundPostsView === null) throw new NotFoundException()
    return foundPostsView
  }

  @Post(":blogId/posts")
  async createPost(
    @Param() params: ObjectIdBlogIdModel,
    @Body() bodyBlogPost: BodyBlogPostModel
  ) {
    const result = await this.blogsService.createPost(bodyBlogPost, params.blogId)
    if (result.error !== null) throw new NotFoundException([{
      message: `blog with blogId: '${params.blogId}' doesn't exist`,
      field: `blogId`
    }])
    return result.data
  }
}
