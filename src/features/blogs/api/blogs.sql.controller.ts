import { Controller, ForbiddenException, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common"
import { AccessMiddleware } from "../../../infrastructure/guards/access-middleware.guard"
import { BlogsQueryRepository } from "../repository/mongoose/blogs.query.repository"
import { CreatePostParamInputModel } from "./models/input/create-post.param.input-model"
import { DeviceSessionOptionalReqInputModel } from "./models/input/device-session-optional.req.input-model"
import { GetBlogsQueryInputModel } from "./models/input/get-blogs.query.input-model"
import { GetPostsQueryInputModel } from "./models/input/get-posts.query.input-model"
import { IdParamInputModel } from "./models/input/id.param.input-model"
import { PostsQueryRepository } from "../../posts/repository/mongoose/posts.query.repository"
import { DeviceSessionOptional } from "../../../infrastructure/decorators/device-session-optional.decorator"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { BlogsSqlQueryRepository } from "../repository/sql/blogs.sql.query.repository"
import { PostsSqlQueryRepository } from "../../posts/repository/sql/posts.sql.query.repository"


@Controller("blogs")
export class BlogsSqlController {
  constructor(
    protected blogsSqlQueryRepository: BlogsSqlQueryRepository,
    protected postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {
  }

  @Get()
  async getBlogs(
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    return await this.blogsSqlQueryRepository.findBlogs(queryBlog)
  }

  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async getPosts(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Param() param: CreatePostParamInputModel,
    @Query() queryPost: GetPostsQueryInputModel,
  ) {
    const postsContract = await this.blogsSqlQueryRepository.findBlogPosts(
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
    @Param() param: IdParamInputModel,
  ) {
    const foundBlogView = await this.blogsSqlQueryRepository.findBlog(param.id)

    if (foundBlogView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return foundBlogView
  }

}
