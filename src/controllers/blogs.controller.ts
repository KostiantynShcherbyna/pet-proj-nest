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
  Inject, Req, UseGuards
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
    @Param("id" /*ParseObjectIdPipe*/) id: ObjectIdIdModel,
  ) {
    const foundBlogView = await this.blogsQueryRepository.findBlog(id.id)
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
  @HttpCode(204)
  async updateBlog(
    @Param("id", /*ParseObjectIdPipe*/) id: ObjectIdIdModel,
    @Body() bodyBlog: BodyBlogModel
  ) {
    const result = await this.blogsService.updateBlog(id.id, bodyBlog)
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @Delete(":id")
  @HttpCode(204)
  async deleteBlog(
    @Param("id", /*ParseObjectIdPipe*/) id: ObjectIdIdModel
  ) {
    const result = await this.blogsService.deleteBlog(id.id)
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async findPosts(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param("blogId", /*ParseObjectIdPipe*/) blogId: ObjectIdBlogIdModel,
    @Query() queryPost: QueryPostModel,
  ) {
    const foundPostsView = await this.postsQueryRepository.findPosts(queryPost, blogId.blogId, deviceSession.userId)
    if (foundPostsView === null) throw new NotFoundException()
    return foundPostsView
  }

  @Post(":blogId/posts")
  async createPost(
    @Param("blogId", /*ParseObjectIdPipe*/) blogId: ObjectIdBlogIdModel,
    @Body() bodyBlogPost: BodyBlogPostModel
  ) {
    const result = await this.blogsService.createPost(bodyBlogPost, blogId.blogId)
    if (result.error !== null) throw new NotFoundException([{
      message: `blog with blogId: '${blogId}' doesn't exist`,
      field: `blogId`
    }])
    return result.data
  }
}
