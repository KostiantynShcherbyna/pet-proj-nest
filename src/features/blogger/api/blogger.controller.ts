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
import { DeviceSessionOptional } from "src/infrastructure/decorators/device-session-optional.decorator"
import { DeviceSession } from "src/infrastructure/decorators/device-session.decorator"
import { AccessGuard } from "src/infrastructure/guards/access.guard"
import { UpdatePostBodyInputModel } from "src/features/blogger/api/models/input/update-post.body.input-model"
import { CreatePostBodyInputModel } from "src/features/blogger/api/models/input/create-post.body.input-model"
import { BanUserBodyInputModel } from "src/features/blogger/api/models/input/ban-user.body.input-model"

import { GetPostsQueryInputModel } from "src/features/blogger/api/models/input/get-posts.query.input-model"
import { UpdatePostParamInputModel } from "src/features/blogger/api/models/input/update-post.param.input-model"
import { PostsQueryRepository } from "src/features/posts/infrastructure/posts.query.repository"
import { BanUserBloggerCommand } from "src/features/blogger/application/ban-user-blogger.use-case"
import { CreateBlogCommand } from "src/features/blogger/application/create-blog.use-case"
import { CreatePostCommand } from "src/features/blogger/application/create-post.use-case"
import { DeleteBlogCommand } from "src/features/blogger/application/delete-blog.use-case"
import { DeletePostCommand } from "src/features/blogger/application/delete-post.use-case"
import { UpdateBlogCommand } from "src/features/blogger/application/update-blog.use-case"
import { UpdatePostCommand } from "src/features/blogger/application/update-post.use-case"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"
import { callErrorMessage } from "src/infrastructure/adapters/exception-message.adapter"
import { UpdateBlogBodyInputModel } from "./models/input/update-blog.body.input-model"
import { GetBlogsQueryInputModel } from "./models/input/get-blogs.query.input-model"
import { DeviceSessionOptionalReqInputModel } from "./models/input/device-session-optional.req.input-model"
import { CreatePostParamInputModel } from "./models/input/create-post.param.input-model"
import { IdParamInputModel } from "./models/input/id.param.input-model"
import { BlogsQueryRepository } from "../../blogs/infrastructure/blogs.query.repository"
import { GetPostsCommentsQueryInputModel } from "./models/input/get-posts-comments.query.input-model"
import { DeviceSessionReqInputModel } from "./models/input/device-session.req.input-model"

@Controller("blogger")
export class BloggerController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {
  }


  @UseGuards(AccessGuard)
  @Get("blogs/comments")
  async getPostsComments(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Query() queryPostsComments: GetPostsCommentsQueryInputModel,
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: IdParamInputModel,
    @Body() bodyBlog: UpdateBlogBodyInputModel
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: IdParamInputModel
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Body() bodyBlog: UpdateBlogBodyInputModel
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Query() queryBlog: GetBlogsQueryInputModel
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
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Param() param: CreatePostParamInputModel,
    @Body() bodyBlogPost: CreatePostBodyInputModel
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: CreatePostParamInputModel,
    @Query() queryPost: GetPostsQueryInputModel,
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
    @Param() param: UpdatePostParamInputModel,
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Body() bodyPost: UpdatePostBodyInputModel,
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
    @Param() param: UpdatePostParamInputModel,
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: IdParamInputModel,
    @Body() bodyUserBan: BanUserBodyInputModel
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
    if (banContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
    )
    if (banContract.error === ErrorEnums.DEVICES_NOT_DELETE) throw new InternalServerErrorException()
    return
  }

  @UseGuards(AccessGuard)
  @Get("users/blog/:id")
  async getBannedBlogUsers(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: IdParamInputModel,
    @Query() queryBlog: GetPostsCommentsQueryInputModel
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
