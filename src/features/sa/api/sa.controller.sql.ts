import {
  BadRequestException,
  Body,
  Controller,
  Delete, ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query, UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { GetBlogsQueryInputModel } from "./models/input/get-blogs.query.input-model"
import { BlogsQueryRepository } from "../../blogs/repository/mongoose/blogs.query.repository"
import { BasicGuard } from "../../../infrastructure/guards/basic.guard"
import { BanBlogParamInputModel } from "./models/input/ban-blog.param.input-model"
import { BanBlogBodyInputModel } from "./models/input/ban-blog.body.input-model"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { BanBlogCommand } from "../application/use-cases/mongoose/ban-blog.use-case"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { BindInputModel } from "./models/input/bind-blog.param.input-model"
import { BindBlogCommand } from "../application/use-cases/mongoose/bind-blog.use-case"
import { BanUserBodyInputModel } from "./models/input/ban-user.body.input-model"
import { QueryUserSAInputModel } from "./models/input/get-users.query.input-model"
import { CreateUserBodyInputModel } from "./models/input/create-user.body.input-model"
import { BanUserCommandSql } from "../application/use-cases/sql/ban-user.use-case.sql"
import { CreateUserSqlCommand } from "../application/use-cases/sql/create-user.use-case.sql"
import { UsersQueryRepositoryOrm } from "../repository/orm/users.query.repository.orm"
import { DeleteUserCommandSql } from "../application/use-cases/sql/delete-user.use-case.sql"
import { IdSqlParamInputModel } from "./models/input/id.sql.param.input-model"
import { BanBlogCommandSql } from "../application/use-cases/sql/ban-blog.use-case.sql"
import { BindBlogCommandSql } from "../application/use-cases/sql/bind-blog.use-case.sql"
import { BlogsQueryRepositoryOrm } from "../../blogs/repository/orm/blogs.query.repository.orm"
import { BanBlogParamInputModelSql } from "./models/input/ban-blog.param.input-model.sql"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { DeviceSessionInputModel } from "../../blogger/api/models/input/device-session.input-model"
import { GetPostsCommentsQueryInputModel } from "../../blogger/api/models/input/get-posts-comments.query.input-model"
import { IdParamInputModelSql } from "../../blogger/api/models/input/id.param.input-model.sql"
import { UpdateBlogBodyInputModel } from "../../blogger/api/models/input/update-blog.body.input-model"
import { UpdateBlogCommandSql } from "../../blogger/application/use-cases/sql/update-blog.use-case.sql"
import { DeleteBlogCommandSql } from "../../blogger/application/use-cases/sql/delete-blog.use-case.sql"
import { CreateBlogBodyInputModel } from "../../blogger/api/models/input/create-blog.body.input-model"
import { CreateBlogCommandSql } from "../../blogger/application/use-cases/sql/create-blog.use-case.sql"
import { BlogIdParamInputModelSql } from "../../blogger/api/models/input/blogId.param.input-model.sql"
import { DeviceSessionOptional } from "../../../infrastructure/decorators/device-session-optional.decorator"
import { DeviceSessionOptionalInputModel } from "../../blogger/api/models/input/device-session-optional.input-model"
import { CreatePostBodyInputModel } from "../../blogger/api/models/input/create-post.body.input-model"
import { CreatePostCommandSql } from "../../blogger/application/use-cases/sql/create-post.use-case.sql"
import { UpdatePostParamInputModelSql } from "../../blogger/api/models/input/update-post.param.input-model.sql"
import { UpdatePostBodyInputModel } from "../../blogger/api/models/input/update-post.body.input-model"
import { UpdatePostCommandSql } from "../../blogger/application/use-cases/sql/update-post.use-case.sql"
import { DeletePostCommandSql } from "../../blogger/application/use-cases/sql/delete-post.use-case.sql"
import { BanUserBodyInputModelSql } from "../../blogger/api/models/input/ban-user.body.input-model.sql"
import { BanUserBloggerCommandSql } from "../../blogger/application/use-cases/sql/ban-user-blogger.use-case.sql"
import { PostsQueryRepositoryOrm } from "../../posts/repository/orm/posts.query.repository.orm"
import { CommentsQueryRepositoryOrm } from "../../comments/repository/orm/comments.query.repository.orm"
import { CreateBlogSACommandSql } from "../application/use-cases/sql/create-blog.use-case.sql"
import { UpdateBlogSACommandSql } from "../application/use-cases/sql/update-blog.use-case.sql"
import { DeleteBlogSACommandSql } from "../application/use-cases/sql/delete-blog.use-case.sql"
import { CreatePostSACommandSql } from "../application/use-cases/sql/create-post.use-case.sql"
import { UpdatePostSACommandSql } from "../application/use-cases/sql/update-post.use-case.sql"
import { DeletePostSACommandSql } from "../application/use-cases/sql/delete-post.use-case.sql"

@Controller("sa")
export class SaControllerSql {
  constructor(
    private commandBus: CommandBus,
    protected usersSqlQueryRepository: UsersQueryRepositoryOrm,
    protected blogsQueryRepositorySql: BlogsQueryRepositoryOrm,
    protected postsQueryRepositorySql: PostsQueryRepositoryOrm,
    protected commentsQueryRepositorySql: CommentsQueryRepositoryOrm,
  ) {
  }


  // @UseGuards(BasicGuard)
  // @Put("blogs/:id/ban")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async banBlog(
  //   @Param() param: BanBlogParamInputModelSql,
  //   @Body() bodyBlogBan: BanBlogBodyInputModel,
  // ) {
  //   const banContract = await this.commandBus.execute(
  //     new BanBlogCommandSql(
  //       param.id,
  //       bodyBlogBan.isBanned,
  //     )
  //   )
  //   if (banContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
  //   )
  //   return
  // }


  @UseGuards(BasicGuard)
  @Put("blogs/:id/bind-with-user/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlog(
    @Param() param: BindInputModel,
  ) {
    const foundBlogContract = await this.commandBus.execute(
      new BindBlogCommandSql(
        param.id,
        param.userId
      )
    )
    if (foundBlogContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (foundBlogContract.error === ErrorEnums.BLOG_ALREADY_BOUND) throw new BadRequestException(
      callErrorMessage(ErrorEnums.BLOG_ALREADY_BOUND, "id")
    )
    return
  }


  // @UseGuards(BasicGuard)
  // @Get("blogs")
  // async getBlogs(
  //   @Query() queryBlog: GetBlogsQueryInputModel
  // ) {
  //   return await this.blogsQueryRepositorySql.findBlogsSA(queryBlog)
  // }


  // USERS ↓↓↓
  // @UseGuards(BasicGuard)
  // @Put("users/:id/ban")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async banUser(
  //   @Param() param: IdSqlParamInputModel,
  //   @Body() bodyUserBan: BanUserBodyInputModel
  // ) {
  //   const banContract = await this.commandBus.execute(
  //     new BanUserCommandSql(
  //       param.id,
  //       bodyUserBan.isBanned,
  //       bodyUserBan.banReason,
  //     )
  //   )
  //   if (banContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
  //   )
  //   if (banContract.error === ErrorEnums.USER_NOT_BANNED) throw new InternalServerErrorException()
  //   return
  // }

  @UseGuards(BasicGuard)
  @Get("users")
  async getUsers(
    @Query() queryUser: QueryUserSAInputModel
  ) {
    return await this.usersSqlQueryRepository.findUsers(queryUser)
  }


  @UseGuards(BasicGuard)
  @Post("users")
  async createUser(
    @Body() bodyUser: CreateUserBodyInputModel
  ) {
    const createResult = await this.commandBus.execute(
      new CreateUserSqlCommand(
        bodyUser.login,
        bodyUser.email,
        bodyUser.password
      )
    )
    if (createResult.error === ErrorEnums.USER_EMAIL_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_EMAIL_EXIST, bodyUser.email)
    )
    if (createResult.error === ErrorEnums.USER_LOGIN_EXIST) throw new BadRequestException(
      callErrorMessage(ErrorEnums.USER_LOGIN_EXIST, bodyUser.login)
    )
    const userView = await this.usersSqlQueryRepository.findUserByUserId(createResult.data)
    if (userView === null) throw new NotFoundException()
    return userView
  }


  @UseGuards(BasicGuard)
  @Delete("users/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param() param: IdSqlParamInputModel
  ) {
    const resultContract = await this.commandBus.execute(
      new DeleteUserCommandSql(param.id)
    )
    if (resultContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "id")
    )
    if (resultContract.error === ErrorEnums.USER_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_DELETED, "id")
    )
    return
  }


//   BLOGGER
  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Get("blogs/comments")
  async getPostsComments(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryPostsComments: GetPostsCommentsQueryInputModel,
  ) {
    const postsComments = await this.commentsQueryRepositorySql.findAllBlogComments(
      queryPostsComments,
      deviceSession.userId,
    )
    return postsComments
  }


  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Put("blogs/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    // @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdParamInputModelSql,
    @Body() bodyBlog: UpdateBlogBodyInputModel
  ) {
    const updateBlogResult = await this.commandBus.execute(
      new UpdateBlogSACommandSql(param.id, bodyBlog)
    )
    if (updateBlogResult.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (updateBlogResult.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
    )
    return
  }


  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Delete("blogs/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    // @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdParamInputModelSql
  ) {
    const deleteBlogResult = await this.commandBus.execute(
      new DeleteBlogSACommandSql(param.id)
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


  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Post("blogs")
  async createBlog(
    @Body() bodyBlog: CreateBlogBodyInputModel,
  ) {
    const newBlogContract = await this.commandBus.execute(
      new CreateBlogSACommandSql(
        bodyBlog.name,
        bodyBlog.description,
        bodyBlog.websiteUrl
      )
    )
    if (newBlogContract.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    const newBlogView = await this.blogsQueryRepositorySql.findNewBlog(newBlogContract.data)
    return newBlogView
  }


  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Get("blogs")
  async getBlogs(
    // @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    const blogs = await this.blogsQueryRepositorySql.findBlogsSA(queryBlog)
    return blogs
  }

  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Get("blogs/:blogId/posts")
  async getPosts(
    // @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Query() queryBlog: GetBlogsQueryInputModel,
    @Param() param: BlogIdParamInputModelSql,
  ) {
    const postsContract = await this.postsQueryRepositorySql.findBlogPosts(
      queryBlog,
      param.blogId,
      // deviceSession.userId,
    )
    if (postsContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
    return postsContract.data
  }


  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Post("blogs/:blogId/posts")
  async createPost(
    // @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() param: BlogIdParamInputModelSql,
    @Body() bodyBlogPost: CreatePostBodyInputModel
  ) {
    const newPostContract = await this.commandBus.execute(
      new CreatePostSACommandSql(
        bodyBlogPost.title,
        bodyBlogPost.shortDescription,
        bodyBlogPost.content,
        param.blogId,
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


  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Put("blogs/:blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() param: UpdatePostParamInputModelSql,
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Body() bodyPost: UpdatePostBodyInputModel,
  ) {
    const updateContract = await this.commandBus.execute(
      new UpdatePostSACommandSql(
        bodyPost,
        param.blogId,
        param.postId,
        // deviceSession.userId,
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


  @UseGuards(BasicGuard)
  // @UseGuards(AccessGuard)
  @Delete("blogs/:blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() param: UpdatePostParamInputModelSql,
    // @DeviceSession() deviceSession: DeviceSessionInputModel,
  ) {
    const deleteContract = await this.commandBus.execute(
      new DeletePostSACommandSql(
        param.blogId,
        param.postId,
        // deviceSession.userId,
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
    if (banContract.error === ErrorEnums.USER_NOT_BANNED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_BANNED, "id")
    )
    return
  }

  @UseGuards(AccessGuard)
  @Get("users/blog/:id")
  async getBannedUsersOfBlog(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: IdParamInputModelSql,
    @Query() queryBlog: GetPostsCommentsQueryInputModel
  ) {
    const bannedBlogUsersContract = await this.blogsQueryRepositorySql.findBanBlogUsers(
      param.id,
      true,
      queryBlog,
      deviceSession.userId,
    )
    if (bannedBlogUsersContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    if (bannedBlogUsersContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_BLOG, "id")
    )
    return bannedBlogUsersContract.data
  }

}
