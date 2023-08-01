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
import { DeviceSession } from "src/decorators/device-session.decorator"
import { AccessGuard } from "src/guards/access.guard"
import { BodyBlogPostBloggerInputModel } from "src/input-models/body/body-blog-post-blogger.input-model"
import { BodyBlogPostInputModel } from "src/input-models/body/body-blog-post.input-model"
import { BodyUserBanBloggerInputModel } from "src/input-models/body/body-user-ban-blogger.input-model"
import { QueryBannedBlogUsersInputModel } from "src/input-models/query/query-banned-blog-users.input-model"
import { QueryPostsInputModel } from "src/input-models/query/query-posts.input-model"
import { DeviceSessionInputModel } from "src/input-models/request/device-session.input-model"
import { BloggerInputModel } from "src/input-models/uri/blogger.input-model"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { BanUserBloggerCommand } from "src/use-cases/blogger/ban-user-blogger.use-case"
import { CreateBlogCommand } from "src/use-cases/blogger/create-blog.use-case"
import { CreatePostBlogger, CreatePostCommand } from "src/use-cases/blogger/create-post.use-case"
import { DeleteBlogCommand } from "src/use-cases/blogger/delete-blog.use-case"
import { DeletePostCommand } from "src/use-cases/blogger/delete-post.use-case"
import { UpdateBlogCommand } from "src/use-cases/blogger/update-blog.use-case"
import { UpdatePostCommand } from "src/use-cases/blogger/update-post.use-case"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { BodyBlogInputModel } from "../input-models/body/body-blog.input-model"
import { QueryBlogsInputModel } from "../input-models/query/query-blogs.input-model"
import { DeviceSessionOptionalInputModel } from "../input-models/request/device-session-optional.input-model"
import { BlogIdInputModel } from "../input-models/uri/blogId.input-model"
import { IdInputModel } from "../input-models/uri/id.input-model"
import { BlogsQueryRepository } from "../repositories/query/blogs.query.repository"
import { BlogsService } from "../services/blogs.service"
import { QueryPostsCommentsInputModel } from "src/input-models/query/query-posts-comments.input-model"

@Controller("blogger")
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
  @Get("blogs/comments")
  async getPostsComments(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryPostsComments: QueryPostsCommentsInputModel,
  ) {
    const postsComments = await this.blogsQueryRepository.findPostsComments(
      queryPostsComments,
      deviceSession.userId,
    )
    return postsComments
  }



  @UseGuards(AccessGuard)
  @Put("blogs/:id")
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
    if (updateBlogResult.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
    )
    return
  }



  @UseGuards(AccessGuard)
  @Delete("blogs/:id")
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
    if (deleteBlogResult.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
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
  @Post("blogs")
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
  @Get("blogs")
  async getBlogs(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: QueryBlogsInputModel
  ) {
    const blogs = await this.blogsQueryRepository.findBlogs(
      queryBlog,
      deviceSession.userId,
    )
    return blogs
  }



  @UseGuards(AccessGuard)
  @Post("blogs/:blogId/posts")
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
    if (result.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
    return result.data
  }



  @UseGuards(AccessGuard)
  @Get("blogs/:blogId/posts")
  async getPosts(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: BlogIdInputModel,
    @Query() queryPost: QueryPostsInputModel,
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
  @Put("blogs/:blogId/posts/:postId")
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
    if (updateContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "postId")
    )
    if (updateContract.error === ErrorEnums.FOREIGN_POST) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_POST, "postId")
    )
    return
  }



  @UseGuards(AccessGuard)
  @Delete("blogs/:blogId/posts/:postId")
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
    if (deleteContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "postId")
    )
    if (deleteContract.error === ErrorEnums.FOREIGN_POST) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_POST, "postId")
    )
    return
  }


  // ↓↓↓ USERS
  @UseGuards(AccessGuard)
  @Put("users/:id/ban")
  async banUser(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdInputModel,
    @Body() bodyUserBan: BodyUserBanBloggerInputModel
  ) {
    const banContract = await this.commandBus.execute(
      new BanUserBloggerCommand(
        deviceSession.userId,
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

  @UseGuards(AccessGuard)
  @Get("users/blog/:id")
  async getBannedBlogUsers(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdInputModel,
    @Query() queryBlog: QueryBannedBlogUsersInputModel
  ) {
    const bannedBlogusersContract = await this.blogsQueryRepository.findBannedBlogUsers(
      queryBlog,
      param.id,
      deviceSession.userId,
    )
    if (bannedBlogusersContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (bannedBlogusersContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
    )
    return bannedBlogusersContract.data
  }



}
