import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject, Req, UseGuards, HttpStatus, Patch, InternalServerErrorException } from "@nestjs/common"
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository"
import { PostsService } from "src/services/posts.service"
import { BodyPostModel } from "src/models/body/BodyPostModel"
import { QueryPostModel } from "src/models/query/QueryPostModel"
import { QueryCommentModel } from "src/models/query/QueryCommentModel"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { BodyLikeModel } from "../models/body/BodyLikeModel"
import { ErrorEnums } from "../utils/errors/errorEnums"
import { OptionalDeviceSessionModel } from "../models/request/optional-device-session.model"
import { DeviceSessionModel } from "../models/request/device-session.model"
import { AccessMiddleware } from "../guards/access.middleware"
import { AccessGuard } from "../guards/access.guard"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"
import { BasicGuard } from "../guards/basic.guard"
import { ObjectIdPostIdModel } from "../models/uri/ObjectId-postId.model"
import { callErrorMessage } from "src/utils/errors/callErrorMessage"
import { CommentsService } from "src/services/comments.service"
import { BodyCommentModel } from "src/models/body/BodyCommentModel"

@Controller("posts")
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
    @Inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(CommentsService) protected commentsService: CommentsService,
  ) {
  }

  @UseGuards(AccessMiddleware)
  @Get()
  async findPosts(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Query() queryPost: QueryPostModel
  ) {
    return await this.postsQueryRepository.findPosts(queryPost, deviceSession?.userId)
  }

  @UseGuards(AccessMiddleware)
  @Get(":id")
  async findPost(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param() params: ObjectIdIdModel,
  ) {
    const post = await this.postsQueryRepository.findPost(params.id, deviceSession?.userId)
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
    const resultContruct = await this.postsService.createPost(bodyPost)
    if (resultContruct.error === ErrorEnums.BLOG_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
    )
    return resultContruct.data
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() params: ObjectIdIdModel,
    @Body() bodyPost: BodyPostModel,
  ) {
    const resultContruct = await this.postsService.updatePost(bodyPost, params.id)
    if (resultContruct.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "id")
    )
    return
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() params: ObjectIdIdModel
  ) {
    const resultContruct = await this.postsService.deletePost(params.id)
    if (resultContruct.error === ErrorEnums.POST_NOT_DELETED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_DELETED, "id")
    )
    return
  }

  @UseGuards(AccessMiddleware)
  @Get(":postId/comments")
  async findComments(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param() params: ObjectIdPostIdModel,
    @Query() queryComment: QueryCommentModel,
  ) {
    return await this.commentsQueryRepository.findComments(params.postId, queryComment, deviceSession?.userId)
  }

  @UseGuards(AccessMiddleware)
  @Post(":postId/comments")
  async createComment(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param("postId") params: ObjectIdPostIdModel,
    @Body() bodyComment: BodyCommentModel,
  ) {
    const commentContract = await this.postsService.createComment(deviceSession?.userId, params.postId, bodyComment.content)
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
  async likeStatus(
    @Req() deviceSession: DeviceSessionModel,
    @Param("postId") postId: ObjectIdPostIdModel,
    @Body() bodyLike: BodyLikeModel,
  ) {
    const commentContract = await this.postsService.updateLike(deviceSession.userId, postId.postId, bodyLike.likeStatus)
    if (commentContract.error === ErrorEnums.POST_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.POST_NOT_FOUND, "postId")
    )
    if (commentContract.error === ErrorEnums.USER_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_NOT_FOUND, "userId")
    )
    return true
  }


}
