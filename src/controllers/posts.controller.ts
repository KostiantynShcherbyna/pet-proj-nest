import {
  Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject, Req, UseGuards
} from "@nestjs/common"
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

@Controller("posts")
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository) {
  }

  @Get()
  async findPosts(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Query() queryPost: QueryPostModel) {
    return await this.postsQueryRepository.findPosts(queryPost, deviceSession?.userId)
  }

  @Get(":id")
  async findPost(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param() id: string) {
    const post = await this.postsQueryRepository.findPost(id, deviceSession?.userId)
    if (post === null) throw new NotFoundException()
    return post
  }

  @Post()
  async createPost(
    @Body() bodyPost: BodyPostModel
  ) {
    const result = await this.postsService.createPost(bodyPost)
    if (result.error !== null) throw new NotFoundException()
    return result.data
  }

  @Put(":id") @HttpCode(204)
  async updatePost(
    @Param() id: string,
    @Body() bodyPost: BodyPostModel
  ) {
    const result = await this.postsService.updatePost(bodyPost, id)
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @Delete(":id") @HttpCode(204)
  async deletePost(
    @Param() id: string
  ) {
    const result = await this.postsService.deletePost(id)
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @UseGuards(AccessMiddleware)
  @Get(":postId/comments")
  async findComments(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param("postId") postId: string,
    @Query() queryComment: QueryCommentModel
  ) {
    const comments = await this.commentsQueryRepository.findComments(postId, queryComment, deviceSession?.userId)
    if (!comments.items.length) throw new NotFoundException()
    return comments
  }

  @UseGuards(AccessMiddleware)
  @Get(":postId/comments")
  async createComment(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param("postId") postId: string,
    @Query() queryComment: QueryCommentModel
  ) {
    const comments = await this.commentsQueryRepository.findComments(postId, queryComment, deviceSession?.userId)
    if (!comments.items.length) throw new NotFoundException()
    return comments
  }

  @UseGuards(AccessGuard)
  @Put(":postId/like-status")
  async likeStatus(
    @Req() deviceSession: DeviceSessionModel,
    @Param("postId") postId: string,
    @Body() bodyLike: BodyLikeModel) {
    const comments = await this.postsService.updateLike(deviceSession.userId, postId, bodyLike.likeStatus)
    if (comments.error === ErrorEnums.NOT_FOUND_POST) throw new NotFoundException()
    if (comments.error === ErrorEnums.NOT_FOUND_USER) throw new NotFoundException()
    return comments
  }
}
