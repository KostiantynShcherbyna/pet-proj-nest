import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSessionOptional } from "src/decorators/device-session-optional.decorator"
import { AccessGuard } from "src/guards/access.guard"
import { BodyBlogPostBloggerInputModel } from "src/input-models/body/body-blog-post-blogger.input-model"
import { BodyBlogPostInputModel } from "src/input-models/body/body-blog-post.input-model"
import { QueryPostInputModel } from "src/input-models/query/query-post.input-model"
import { BloggerInputModel } from "src/input-models/uri/blogger.input-model"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { CreatePost, CreatePostCommand } from "src/services/use-cases/blogger/create-post.use-case"
import { CreateBlogCommand } from "src/services/use-cases/blogger/create-blog.use-case"
import { DeleteBlogCommand } from "src/services/use-cases/blogger/delete-blog.use-case"
import { DeletePostCommand } from "src/services/use-cases/blogger/delete-post.use-case"
import { UpdateBlogCommand } from "src/services/use-cases/blogger/update-blog.use-case"
import { UpdatePostCommand } from "src/services/use-cases/blogger/update-post.use-case"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { BodyBlogInputModel } from "../input-models/body/body-blog.input-model"
import { QueryBlogInputModel } from "../input-models/query/query-blog.input-model"
import { DeviceSessionOptionalInputModel } from "../input-models/request/device-session-optional.input-model"
import { BlogIdInputModel } from "../input-models/uri/blogId.input-model"
import { IdInputModel } from "../input-models/uri/id.input-model"
import { BlogsQueryRepository } from "../repositories/query/blogs.query.repository"
import { BlogsService } from "../services/blogs.service"
import { DeviceSession } from "src/decorators/device-session.decorator"
import { DeviceSessionInputModel } from "src/input-models/request/device-session.input-model"

@Controller("blogger/blogs")
export class BloggerController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected transactionScriptService: CreatePost,
    private commandBus: CommandBus,
  ) {
  }

  // @Get(":id")
  // async findBlog(
  //   @Param() param: IdInputModel,
  // ) {
  //   const foundBlogView = await this.blogsQueryRepository.findBlog(param.id)

  //   if (foundBlogView === null) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
  //   )
  //   return foundBlogView
  // }
  @UseGuards(AccessGuard)
  @Get()
  async findBlogs(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: QueryBlogInputModel
  ) {
    return await this.blogsQueryRepository.findBlogs(
      queryBlog,
      deviceSession.userId,
    )
  }

  @UseGuards(AccessGuard)
  @Post()
  async createBlog(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Body() bodyBlog: BodyBlogInputModel
  ) {
    const createdBlogContract = await this.commandBus.execute(
      new CreateBlogCommand(
        bodyBlog.name,
        bodyBlog.description,
        bodyBlog.websiteUrl,
        deviceSession.userId,
      )
    )
    if (createdBlogContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    return createdBlogContract.data
  }


  @UseGuards(AccessGuard)
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdInputModel,
    @Body() bodyBlog: BodyBlogInputModel
  ) {
    console.log(param)
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(
        param.id,
        bodyBlog,
        deviceSession.userId,
      )
    )
    if (result.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return
  }


  @UseGuards(AccessGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdInputModel
  ) {
    const deleteBlogResult = await this.commandBus.execute(
      new DeleteBlogCommand(
        param.id,
        deviceSession.userId
      )
    )
    if (deleteBlogResult.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (deleteBlogResult.error === ErrorEnums.FOREIGN_BLOG_NOT_DELETE) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG_NOT_DELETE, "id")
    )
    if (deleteBlogResult.error === ErrorEnums.BLOG_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_DELETED, "id")
    )
    if (deleteBlogResult.error === ErrorEnums.BLOG_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POSTS_NOT_DELETED, "id")
    )
    return
  }


  @UseGuards(AccessGuard)
  @Get(":blogId/posts")
  async findPosts(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: BlogIdInputModel,
    @Query() queryPost: QueryPostInputModel,
  ) {
    const postsContract = await this.postsQueryRepository.findPosts(
      queryPost,
      deviceSession.userId,
      param.blogId,
    )
    if (postsContract === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
    return postsContract.data
  }


  @UseGuards(AccessGuard)
  @Post(":blogId/posts")
  async createPost(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() param: BlogIdInputModel,
    @Body() bodyBlogPost: BodyBlogPostInputModel
  ) {
    const result = await this.commandBus.execute(
      new CreatePostCommand(
        bodyBlogPost.title,
        bodyBlogPost.shortDescription,
        bodyBlogPost.content,
        param.blogId,
        deviceSession.userId
      )

    )
    if (result.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    return result.data
  }




  @UseGuards(AccessGuard)
  @Put(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() param: BloggerInputModel,
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Body() bodyPost: BodyBlogPostBloggerInputModel,
  ) {
    const resultContruct = await this.commandBus.execute(
      new UpdatePostCommand(
        bodyPost,
        param.blogId,
        param.postId,
        deviceSession.userId,
      )
    )
    if (resultContruct.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "id")
    )
    return
  }

  @UseGuards(AccessGuard)
  @Delete(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() param: BloggerInputModel,
    @DeviceSession() deviceSession: DeviceSessionInputModel,
  ) {
    const resultContruct = await this.commandBus.execute(
      new DeletePostCommand(
        param.blogId,
        param.postId,
        deviceSession.userId,
      )
    )
    if (resultContruct.error === ErrorEnums.POST_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_DELETED, "id")
    )
    return
  }



}
