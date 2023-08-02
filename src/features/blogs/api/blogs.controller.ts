import { Controller, ForbiddenException, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common"
import { DeviceSessionOptional } from "src/infrastructure/decorators/device-session-optional.decorator"
import { GetPostsQueryInputModel } from "src/features/blogger/api/models/input/get-posts.query.input-model"
import { PostsQueryRepository } from "src/features/posts/infrastructure/posts.query.repository"
import { ErrorEnums } from "src/infrastructure/utils/error-enums"
import { callErrorMessage } from "src/infrastructure/adapters/exception-message.adapter"
import { AccessMiddleware } from "../../../infrastructure/guards/access-middleware.guard"
import { GetBlogsQueryInputModel } from "../../blogger/api/models/input/get-blogs.query.input-model"
import {
  DeviceSessionOptionalReqInputModel
} from "../../blogger/api/models/input/device-session-optional.req.input-model"
import { CreatePostParamInputModel } from "../../blogger/api/models/input/create-post.param.input-model"
import { IdParamInputModel } from "../../blogger/api/models/input/id.param.input-model"
import { BlogsQueryRepository } from "../infrastructure/blogs.query.repository"

@Controller("blogs")
export class BlogsController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {
  }

  @Get()
  async getBlogs(
    @Query() queryBlog: GetBlogsQueryInputModel
  ) {
    return await this.blogsQueryRepository.findBlogs(queryBlog)
  }

  @UseGuards(AccessMiddleware)
  @Get(":blogId/posts")
  async getPosts(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
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


  @Get(":id")
  async getBlog(
    @Param() param: IdParamInputModel,
  ) {
    const foundBlogView = await this.blogsQueryRepository.findBlog(param.id)

    if (foundBlogView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )
    return foundBlogView
  }

}
