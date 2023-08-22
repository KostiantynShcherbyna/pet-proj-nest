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
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { DeviceSessionInputModel } from "./models/input/device-session.input-model"
import { IdParamInputModel } from "./models/input/id.param.input-model"
import { UpdateBlogBodyInputModel } from "./models/input/update-blog.body.input-model"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { GetBlogsQueryInputModel } from "./models/input/get-blogs.query.input-model"
import { DeviceSessionOptionalInputModel } from "./models/input/device-session-optional.input-model"
import { DeviceSessionOptional } from "../../../infrastructure/decorators/device-session-optional.decorator"
import { CreatePostBodyInputModel } from "./models/input/create-post.body.input-model"
import { UpdatePostBodyInputModel } from "./models/input/update-post.body.input-model"
import { BanUserBodyInputModel } from "./models/input/ban-user.body.input-model"
import { BanUserBloggerCommand } from "../application/use-cases/mongoose/ban-user-blogger.use-case"
import { CreateBlogBodyInputModel } from "./models/input/create-blog.body.input-model"
import { BlogsQueryRepositorySql } from "../../blogs/repository/sql/blogs.query.repository.sql"
import { CreateBlogCommandSql } from "../application/use-cases/sql/create-blog.use-case.sql"
import { PostsQueryRepositorySql } from "../../posts/repository/sql/posts.query.repository.sql"
import { CreatePostCommandSql } from "../application/use-cases/sql/create-post.use-case.sql"
import { IdParamInputModelSql } from "./models/input/id.param.input-model.sql"
import { UpdateBlogCommandSql } from "../application/use-cases/sql/update-blog.use-case.sql"
import { DeleteBlogCommandSql } from "../application/use-cases/sql/delete-blog.use-case.sql"
import { DeletePostCommandSql } from "../application/use-cases/sql/delete-post.use-case.sql"
import { UpdatePostParamInputModelSql } from "./models/input/update-post.param.input-model.sql"
import { BlogIdParamInputModelSql } from "./models/input/blogId.param.input-model.sql"
import { UpdatePostCommandSql } from "../application/use-cases/sql/update-post.use-case.sql"
import { BanUserBodyInputModelSql } from "./models/input/ban-user.body.input-model.sql"
import { BanUserBloggerCommandSql } from "../application/use-cases/sql/ban-user-blogger.use-case.sql"
import { GetPostsCommentsQueryInputModel } from "./models/input/get-posts-comments.query.input-model"


@Controller("blogger")
export class BloggerControllerSql {
  constructor(
    private commandBus: CommandBus,
    protected blogsQueryRepositorySql: BlogsQueryRepositorySql,
    protected postsQueryRepositorySql: PostsQueryRepositorySql,
  ) {
  }


  // @UseGuards(AccessGuard)
  // @Get("blogs/comments")
  // async getPostsComments(
  //   @DeviceSession() deviceSession: DeviceSessionInputModel,
  //   @Query() queryPostsComments: GetPostsCommentsQueryInputModel,
  // ) {
  //   const postsComments = await this.blogsQueryRepositorySql.findPostsComments(
  //     queryPostsComments,
  //     deviceSession.userId,
  //   )
  //   return postsComments
  // }


  @UseGuards(AccessGuard)
  @Put("blogs/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdParamInputModelSql,
    @Body() bodyBlog: UpdateBlogBodyInputModel
  ) {
    const updateBlogResult = await this.commandBus.execute(
      new UpdateBlogCommandSql(
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
    @Param() param: IdParamInputModelSql
  ) {
    const deleteBlogResult = await this.commandBus.execute(
      new DeleteBlogCommandSql(
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
    @Body() bodyBlog: CreateBlogBodyInputModel,
  ) {
    const newBlogContract = await this.commandBus.execute(
      new CreateBlogCommandSql(
        bodyBlog.name,
        bodyBlog.description,
        bodyBlog.websiteUrl,
        deviceSession.userId,
      )
    )
    if (newBlogContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    const newBlogView = await this.blogsQueryRepositorySql.findNewBlog(newBlogContract.data)
    return newBlogView
  }


  @UseGuards(AccessGuard)
  @Get("blogs")
  async getBlogs(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    const blogs = await this.blogsQueryRepositorySql.findBlogs(
      queryBlog,
      deviceSession.userId,
    )
    return blogs
  }

  @UseGuards(AccessGuard)
  @Get("blogs/:blogId/posts")
  async getPosts(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: GetBlogsQueryInputModel,
    @Param() param: BlogIdParamInputModelSql,
  ) {
    const postsView = await this.postsQueryRepositorySql.findPostsOfBlog(
      param.blogId,
      queryBlog,
      deviceSession.userId,
    )
    return postsView
  }


  @UseGuards(AccessGuard)
  @Post("blogs/:blogId/posts")
  async createPost(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() param: BlogIdParamInputModelSql,
    @Body() bodyBlogPost: CreatePostBodyInputModel
  ) {
    const newPostContract = await this.commandBus.execute(
      new CreatePostCommandSql(
        bodyBlogPost.title,
        bodyBlogPost.shortDescription,
        bodyBlogPost.content,
        param.blogId,
        deviceSession.userId
      )
    )
    if (newPostContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (newPostContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()

    const newPostView = await this.postsQueryRepositorySql.findPost(newPostContract.data)
    if (!newPostView) throw new NotFoundException()
    return newPostView
  }


  // @UseGuards(AccessGuard)
  // @Get("blogs/:blogId/posts")
  // async getPosts(
  //   @DeviceSession() deviceSession: DeviceSessionInputModel,
  //   @Param() param: CreatePostParamInputModel,
  //   @Query() queryPost: GetPostsQueryInputModel,
  // ) {
  //   const postsContract = await this.postsQueryRepositorySql.findPosts(
  //     queryPost,
  //     deviceSession.userId,
  //     param.blogId,
  //   )
  //   if (postsContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
  //   )
  //   if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
  //   return postsContract.data
  // }


  @UseGuards(AccessGuard)
  @Put("blogs/:blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() param: UpdatePostParamInputModelSql,
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Body() bodyPost: UpdatePostBodyInputModel,
  ) {
    const updateContract = await this.commandBus.execute(
      new UpdatePostCommandSql(
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
    if (updateContract.error === ErrorEnums.POST_NOT_UPDATED) throw new InternalServerErrorException()
    return
  }


  @UseGuards(AccessGuard)
  @Delete("blogs/:blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() param: UpdatePostParamInputModelSql,
    @DeviceSession() deviceSession: DeviceSessionInputModel,
  ) {
    const deleteContract = await this.commandBus.execute(
      new DeletePostCommandSql(
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
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdParamInputModelSql,
    @Body() bodyUserBan: BanUserBodyInputModelSql
  ) {
    const banContract = await this.commandBus.execute(
      new BanUserBloggerCommandSql(
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
  async getBannedUsersOfBlog(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdParamInputModelSql,
    @Query() queryBlog: GetPostsCommentsQueryInputModel
  ) {
    const bannedBlogusersContract = await this.blogsQueryRepositorySql.findBanUsersInfos(
      param.id,
      true,
      queryBlog,
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
