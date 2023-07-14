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
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"
import { ObjectIdBlogIdModel } from "../models/uri/ObjectId-blogId.model"
import { AccessMiddleware } from "../guards/access.middleware"
import { OptionalDeviceSessionModel } from "../models/request/optional-device-session.model"
import { ErrorEnums } from "src/utils/errors/errorEnums"
import { callErrorMessage } from "src/utils/errors/callErrorMessage"

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

    if (foundBlogView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
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

    if (result.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param() params: ObjectIdIdModel
  ) {
    return await this.blogsService.deleteBlog(params.id)
  }

  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async findPosts(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param() params: ObjectIdBlogIdModel,
    @Query() queryPost: QueryPostModel,
  ) {
    return await this.postsQueryRepository.findPosts(queryPost, params.blogId, deviceSession.userId)
  }

  @Post(":blogId/posts")
  async createPost(
    @Param() params: ObjectIdBlogIdModel,
    @Body() bodyBlogPost: BodyBlogPostModel
  ) {
    const result = await this.blogsService.createPost(bodyBlogPost, params.blogId)
    if (result.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    return result.data
  }
}
