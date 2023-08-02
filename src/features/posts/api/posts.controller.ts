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
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSessionOptional } from "src/infrastructure/decorators/device-session-optional.decorator"
import { DeviceSession } from "src/infrastructure/decorators/device-session.decorator"
import { UpdateCommentBodyInputModel } from "src/features/comments/api/models/input/update-comment.body.input-model"
import { UpdatePostBodyInputModel } from "src/features/posts/api/models/input/update-post.body.input-model"
import { CommentsQueryRepository } from "src/features/comments/infrastructure/comments.query.repository"
import { PostsQueryRepository } from "src/features/posts/infrastructure/posts.query.repository"
import { CreateCommentCommand } from "src/features/posts/application/create-comment.use-case"
import { DeletePostCommand } from "src/features/posts/application/delete-post.use-case"
import { UpdatePostLikeCommand } from "src/features/posts/application/update-post-like.use-case"
import { UpdatePostCommand } from "src/features/posts/application/update-post.use-case"
import { callErrorMessage } from "src/infrastructure/adapters/exception-message.adapter"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { AccessMiddleware } from "../../../infrastructure/guards/access-middleware.guard"
import { BasicGuard } from "../../../infrastructure/guards/basic.guard"
import { GetCommentsParamInputModel } from "./models/input/get-comments.param.input-model"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { DeviceSessionReqInputModel } from "./models/input/device-session.req.input-model"
import { DeviceSessionOptionalReqInputModel } from "./models/input/device-session-optional.req.input-model"
import { GetPostsQueryInputModel } from "./models/input/get-posts.query.input-model"
import { IdParamInputModel } from "./models/input/id.param.input-model"
import { GetCommentsQueryInputModel } from "./models/input/get-comments.query.input-model"
import { LikeStatusBodyInputModel } from "./models/input/like-status.body.input-model"

@Controller("posts")
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {
  }

  @UseGuards(AccessMiddleware)
  @Get()
  async getPosts(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Query() queryPost: GetPostsQueryInputModel
  ) {
    const postsContract = await this.postsQueryRepository.findPosts(queryPost, deviceSession?.userId)
    return postsContract.data
  }

  @UseGuards(AccessMiddleware)
  @Get(":id")
  async getPost(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Param() param: IdParamInputModel,
  ) {
    const postContract = await this.postsQueryRepository.findPost(param.id, deviceSession?.userId)
    if (postContract.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "id")
    )
    if (postContract.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "id")
    )

    return postContract.data
  }

  // @UseGuards(BasicGuard)
  // @Post()
  // async createPost(
  //   @Body() bodyPost: UpdatePostBodyInputModel
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
    @Param() param: IdParamInputModel,
    @Body() bodyPost: UpdatePostBodyInputModel,
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
    @Param() param: IdParamInputModel
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
  async getComments(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Param() param: GetCommentsParamInputModel,
    @Query() queryComment: GetCommentsQueryInputModel,
  ) {
    const commentsContract = await this.commentsQueryRepository.findComments(
      param.postId,
      queryComment,
      deviceSession?.userId
    )
    if (commentsContract.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "postId")
    )
    return commentsContract.data
  }

  @UseGuards(AccessGuard)
  @Post(":postId/comments")
  async createComment(
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: GetCommentsParamInputModel,
    @Body() bodyComment: UpdateCommentBodyInputModel,
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
    if (commentContract.error === ErrorEnums.USER_IS_BANNED) throw new ForbiddenException()

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
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Param() postId: GetCommentsParamInputModel,
    @Body() bodyLike: LikeStatusBodyInputModel,
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
