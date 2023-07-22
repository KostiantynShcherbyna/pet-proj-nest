import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject, Req, UseGuards, HttpStatus, Patch, InternalServerErrorException, UsePipes } from "@nestjs/common"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { PostsService } from "src/services/posts.service"
import { BodyPostModel } from "src/models/body/body-post.model"
import { QueryPostModel } from "src/models/query/query-post.model"
import { QueryCommentModel } from "src/models/query/query-comment.model"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { BodyLikeModel } from "../models/body/body-like.model"
import { ErrorEnums } from "../utils/errors/error-enums"
import { DeviceSessionOptionalModel } from "../models/request/device-session-optional.model"
import { DeviceSessionModel } from "../models/request/device-session.model"
import { AccessMiddleware } from "../guards/access.middleware"
import { AccessGuard } from "../guards/access.guard"
import { ObjectIdIdModel } from "../models/uri/id.model"
import { BasicGuard } from "../guards/basic.guard"
import { ObjectIdPostIdModel } from "../models/uri/postId.model"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { CommentsService } from "src/services/comments.service"
import { BodyCommentModel } from "src/models/body/body-comment.model"
import { BlogsQueryRepository } from "src/repositories/query/blogs.query.repository"
import { UpdatePostCommand } from "src/services/use-cases/posts/update-post.use-case"
import { DeletePostCommand } from "src/services/use-cases/posts/delete-post.use-case"
import { CreateCommentCommand } from "src/services/use-cases/posts/create-comment.use-case"
import { UpdatePostLikeCommand } from "src/services/use-cases/posts/update-post-like.use-case"
import { TransactionScriptService } from "src/services/transaction-script.service"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSessionOptional } from "src/decorators/device-session-optional.decorator"
import { DeviceSessionDecorator } from "src/decorators/device-session.decorator"

@Controller("posts")
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected postsService: PostsService,
    protected commentsService: CommentsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected transactionScriptService: TransactionScriptService,
  ) {
  }

  @UseGuards(AccessMiddleware)
  @Get()
  async findPosts(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalModel,
    @Query() queryPost: QueryPostModel
  ) {
    return await this.postsQueryRepository.findPosts(queryPost, "", deviceSession?.userId)
  }

  @UseGuards(AccessMiddleware)
  @Get(":id")
  async findPost(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalModel,
    @Param() param: ObjectIdIdModel,
  ) {
    const post = await this.postsQueryRepository.findPost(param.id, deviceSession?.userId)
    if (post === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "id")
    )
    return post
  }

  @UseGuards(BasicGuard)
  @Post()
  async createPost(
    @Body() bodyPost: BodyPostModel
  ) {
    const resultContruct = await this.transactionScriptService.createPost(bodyPost)
    if (resultContruct.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    return resultContruct.data
  }

  @UseGuards(BasicGuard)
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() param: ObjectIdIdModel,
    @Body() bodyPost: BodyPostModel,
  ) {
    const resultContruct = await this.commandBus.execute(new UpdatePostCommand(bodyPost, param.id))
    if (resultContruct.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "id")
    )
    return
  }

  @UseGuards(BasicGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() param: ObjectIdIdModel
  ) {
    const resultContruct = await this.commandBus.execute(new DeletePostCommand(param.id))
    if (resultContruct.error === ErrorEnums.POST_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_DELETED, "id")
    )
    return
  }

  @UseGuards(AccessMiddleware)
  @Get(":postId/comments")
  async findComments(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalModel,
    @Param() param: ObjectIdPostIdModel,
    @Query() queryComment: QueryCommentModel,
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
    @DeviceSessionDecorator() deviceSession: DeviceSessionModel,
    @Param() param: ObjectIdPostIdModel,
    @Body() bodyComment: BodyCommentModel,
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
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalModel,
    @Param() postId: ObjectIdPostIdModel,
    @Body() bodyLike: BodyLikeModel,
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
