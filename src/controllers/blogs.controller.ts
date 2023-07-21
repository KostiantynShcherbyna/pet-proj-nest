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
import { BodyBlogModel } from "../models/body/body-blog.model"
import { QueryBlogModel } from "../models/query/query-blog.model"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { QueryPostModel } from "src/models/query/query-post.model"
import { BodyBlogPostModel } from "src/models/body/body-blog-post.model"
import { ObjectIdIdModel } from "../models/uri/id.model"
import { ObjectIdBlogIdModel } from "../models/uri/blogId.model"
import { AccessMiddleware } from "../guards/access.middleware"
import { OptionalDeviceSessionModel } from "../models/request/optional-device-session.model"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { BasicGuard } from "src/guards/basic.guard"
import { CommandBus } from "@nestjs/cqrs"
import { CreateBlogCommand } from "src/services/use-cases/blogs/create-blog.use-case"

@Controller("blogs")
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
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

  @UseGuards(BasicGuard)
  @Post()
  async createBlog(
    @Body() bodyBlog: BodyBlogModel
  ) {
    return this.commandBus.execute(new CreateBlogCommand(bodyBlog))
  }
  // @UseGuards(BasicGuard)
  // @Post()
  // async createBlog(
  //   @Body() bodyBlog: BodyBlogModel
  // ) {
  //   return await this.blogsService.createBlog(bodyBlog)
  // }

  @UseGuards(BasicGuard)
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

  @UseGuards(BasicGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param() params: ObjectIdIdModel
  ) {
    const deleteBlogResult = await this.blogsService.deleteBlog(params.id)
    if (deleteBlogResult.error === ErrorEnums.BLOG_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_DELETED, "id")
    )
    if (deleteBlogResult.error === ErrorEnums.BLOG_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POSTS_NOT_DELETED, "id")
    )
    return
  }

  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async findPosts(
    @Req() req: Request & { deviceSession: OptionalDeviceSessionModel },
    @Param() params: ObjectIdBlogIdModel,
    @Query() queryPost: QueryPostModel,
  ) {
    const postsView = await this.postsQueryRepository.findPosts(queryPost, params.blogId, req.deviceSession?.userId)
    if (postsView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    return postsView
  }

  @UseGuards(BasicGuard)
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
