import { Controller, ForbiddenException, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common"
import { AccessMiddleware } from "../../../infrastructure/guards/access-middleware.guard"
import { DeviceSessionOptionalReqInputModel } from "./models/input/device-session-optional.req.input-model"
import { GetBlogsQueryInputModel } from "./models/input/get-blogs.query.input-model"
import { GetPostsQueryInputModel } from "./models/input/get-posts.query.input-model"
import { DeviceSessionOptional } from "../../../infrastructure/decorators/device-session-optional.decorator"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { BlogsQueryRepositoryOrm } from "../repository/orm/blogs.query.repository.orm"
import { IdParamInputModelSql } from "./models/input/id.param.input-model.sql"
import { CreatePostParamInputModelSql } from "./models/input/create-post.param.input-model.sql"
import { PostsQueryRepositoryOrm } from "../../posts/repository/orm/posts.query.repository.orm"


@Controller("blogs")
export class BlogsControllerSql {
  constructor(
    protected blogsQueryRepositorySql: BlogsQueryRepositoryOrm,
    protected postsQueryRepositorySql: PostsQueryRepositoryOrm,
  ) {
  }

  @Get()
  async getBlogs(
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    return await this.blogsQueryRepositorySql.findBlogs(queryBlog)
  }

  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async getPosts(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Param() param: CreatePostParamInputModelSql,
    @Query() queryPost: GetPostsQueryInputModel,
  ) {
    const postsContract = await this.postsQueryRepositorySql.findBlogPosts(
      queryPost,
      param.blogId,
      deviceSession?.userId,
    )
    if (postsContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
    return postsContract.data
  }


  @Get(":id")
  async getBlog(
    @Param() param: IdParamInputModelSql,
  ) {
    const foundBlogView = await this.blogsQueryRepositorySql.findBlog(param.id)

    if (foundBlogView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return foundBlogView
  }

}
