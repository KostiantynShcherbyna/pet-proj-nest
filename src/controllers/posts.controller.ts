import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Query, UseGuards } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSessionOptional } from "src/decorators/device-session-optional.decorator"
import { DeviceSession } from "src/decorators/device-session.decorator"
import { BodyCommentInputModel } from "src/input-models/body/body-comment.input-model"
import { BodyPostInputModel } from "src/input-models/body/body-post.input-model"
import { QueryCommentInputModel } from "src/input-models/query/query-comment.input-model"
import { QueryPostInputModel } from "src/input-models/query/query-post.input-model"
import { BlogsQueryRepository } from "src/repositories/query/blogs.query.repository"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { CommentsService } from "src/services/comments.service"
import { PostsService } from "src/services/posts.service"
import { CreatePost } from "src/services/use-cases/blogger/create-post.use-case"
import { CreateCommentCommand } from "src/services/use-cases/posts/create-comment.use-case"
import { DeletePostCommand } from "src/services/use-cases/posts/delete-post.use-case"
import { UpdatePostLikeCommand } from "src/services/use-cases/posts/update-post-like.use-case"
import { UpdatePostCommand } from "src/services/use-cases/posts/update-post.use-case"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { AccessGuard } from "../guards/access.guard"
import { AccessMiddleware } from "../guards/access.middleware"
import { BasicGuard } from "../guards/basic.guard"
import { BodyLikeInputModel } from "../input-models/body/body-like.input-model"
import { DeviceSessionOptionalInputModel } from "../input-models/request/device-session-optional.input-model"
import { DeviceSessionInputModel } from "../input-models/request/device-session.input-model"
import { IdInputModel } from "../input-models/uri/id.input-model"
import { PostIdInputModel } from "../input-models/uri/postId.input-model"
import { ErrorEnums } from "../utils/errors/error-enums"

@Controller("posts")
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected postsService: PostsService,
    protected commentsService: CommentsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected transactionScriptService: CreatePost,
  ) {
  }

  @UseGuards(AccessMiddleware)
  @Get()
  async findPosts(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Query() queryPost: QueryPostInputModel
  ) {
    const postsContract = await this.postsQueryRepository.findPosts(queryPost, deviceSession.userId)
    // if (postsContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
    //   callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    // )
    // if (postsContract.error === ErrorEnums.FOREIGN_BLOG) throw new ForbiddenException()
    return postsContract.data
  }

  @UseGuards(AccessMiddleware)
  @Get(":id")
  async findPost(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() param: IdInputModel,
  ) {
    const post = await this.postsQueryRepository.findPost(param.id, deviceSession?.userId)
    if (post === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "id")
    )
    return post
  }

  // @UseGuards(BasicGuard)
  // @Post()
  // async createPost(
  //   @Body() bodyPost: BodyPostInputModel
  // ) {
  //   const resultContruct = await this.transactionScriptService.createPost(bodyPost)
  //   if (resultContruct.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
  //     callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
  //   )
  //   return resultContruct.data
  // }

  @UseGuards(BasicGuard)
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() param: IdInputModel,
    @Body() bodyPost: BodyPostInputModel,
  ) {
    const resultContruct = await this.commandBus.execute(
      new UpdatePostCommand(
        bodyPost,
        param.id
      )
    )
    if (resultContruct.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "id")
    )
    return
  }

  @UseGuards(BasicGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() param: IdInputModel
  ) {
    const resultContruct = await this.commandBus.execute(
      new DeletePostCommand(param.id)
    )
    if (resultContruct.error === ErrorEnums.POST_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_DELETED, "id")
    )
    return
  }

  @UseGuards(AccessMiddleware)
  @Get(":postId/comments")
  async findComments(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() param: PostIdInputModel,
    @Query() queryComment: QueryCommentInputModel,
  ) {
    const commentsView = await this.commentsQueryRepository.findComments(
      param.postId,
      queryComment,
      deviceSession?.userId
    )
    if (commentsView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "postId")
    )
    return commentsView
  }

  @UseGuards(AccessGuard)
  @Post(":postId/comments")
  async createComment(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: PostIdInputModel,
    @Body() bodyComment: BodyCommentInputModel,
  ) {
    const commentContract = await this.commandBus.execute(
      new CreateCommentCommand(
        deviceSession?.userId,
        param.postId,
        bodyComment.content
      )
    )
    if (commentContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "userId")
    )
    if (commentContract.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "postId")
    )
    if (commentContract.error === ErrorEnums.COMMENT_NOT_FOUND) throw new InternalServerErrorException()
    return commentContract.data
  }

  @UseGuards(AccessGuard)
  @Put(":postId/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() postId: PostIdInputModel,
    @Body() bodyLike: BodyLikeInputModel,
  ) {
    const commentContract = await this.commandBus.execute(
      new UpdatePostLikeCommand(
        deviceSession.userId,
        postId.postId,
        bodyLike.likeStatus
      )
    )
    if (commentContract.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "postId")
    )
    if (commentContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "userId")
    )
    return true
  }


}
