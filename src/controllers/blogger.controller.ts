import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
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
import { CreatePostBlogger, CreatePostCommand } from "src/use-cases/blogger/create-post.use-case"
import { CreateBlogCommand } from "src/use-cases/blogger/create-blog.use-case"
import { DeleteBlogCommand } from "src/use-cases/blogger/delete-blog.use-case"
import { DeletePostCommand } from "src/use-cases/blogger/delete-post.use-case"
import { UpdateBlogCommand } from "src/use-cases/blogger/update-blog.use-case"
import { UpdatePostCommand } from "src/use-cases/blogger/update-post.use-case"
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
import { BodyUserBanInputModel } from "src/input-models/body/body-user-ban.input-model"
import { BanUserCommand } from "src/use-cases/users/ban-user.use-case"
import { BodyUserBanBloggerInputModel } from "src/input-models/body/body-user-ban-blogger.input-model"
import { BanUserBloggerCommand } from "src/use-cases/blogger/ban-user-blogger.use-case"

@Controller("blogger/blogs")
export class BloggerController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected transactionScriptService: CreatePostBlogger,
    private commandBus: CommandBus,
  ) {
  }


  @UseGuards(AccessGuard)
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdInputModel,
    @Body() bodyBlog: BodyBlogInputModel
  ) {
    const updateBlogResult = await this.commandBus.execute(
      new UpdateBlogCommand(
        param.id,
        bodyBlog,
        deviceSession.userId,
      )
    )
    if (updateBlogResult.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (updateBlogResult.error === ErrorEnums.FOREIGN_BLOG_NOT_UPDATE) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG_NOT_UPDATE, "id")
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
  @Get()
  async findBlogs(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: QueryBlogInputModel
  ) {
    const blogs = await this.blogsQueryRepository.findBlogs(
      queryBlog,
      deviceSession.userId,
    )
    return blogs
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
    if (result.error === ErrorEnums.FOREIGN_BLOG_NOT_CREATE_POST) throw new ForbiddenException()
    return result.data
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
    if (postsContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
    return postsContract.data
  }



  @UseGuards(AccessGuard)
  @Put(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() param: BloggerInputModel,
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Body() bodyPost: BodyBlogPostBloggerInputModel,
  ) {
    const updateContract = await this.commandBus.execute(
      new UpdatePostCommand(
        bodyPost,
        param.blogId,
        param.postId,
        deviceSession.userId,
      )
    )
    if (updateContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (updateContract.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "postId")
    )
    if (updateContract.error === ErrorEnums.FOREIGN_BLOG_NOT_UPDATE_POST) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG_NOT_UPDATE_POST, "postId")
    )
    if (updateContract.error === ErrorEnums.FOREIGN_POST_NOT_UPDATE_POST) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_POST_NOT_UPDATE_POST, "postId")
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
    const deleteContract = await this.commandBus.execute(
      new DeletePostCommand(
        param.blogId,
        param.postId,
        deviceSession.userId,
      )
    )
    if (deleteContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (deleteContract.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "postId")
    )
    if (deleteContract.error === ErrorEnums.FOREIGN_BLOG_NOT_DELETE_POST) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG_NOT_DELETE_POST, "postId")
    )
    if (deleteContract.error === ErrorEnums.FOREIGN_POST_NOT_DELETE_POST) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_POST_NOT_DELETE_POST, "postId")
    )
    return
  }



  @UseGuards(AccessGuard)
  @Put("users/:id/ban")
  async banUser(
    @Param() param: IdInputModel,
    @Body() bodyUserBan: BodyUserBanBloggerInputModel
  ) {
    const banContract = await this.commandBus.execute(
      new BanUserBloggerCommand(
        param.id,
        bodyUserBan,
      )
    )
    if (banContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
    )
    if (banContract.error === ErrorEnums.DEVICES_NOT_DELETE) throw new InternalServerErrorException()
    return
  }




}
