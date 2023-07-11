import {
  Controller,
  Get,
  Param,
  Inject,
  NotFoundException, Put, Body, Req, ForbiddenException, HttpCode, HttpStatus, Delete, UseGuards
} from "@nestjs/common"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import ParseObjectIdPipe from "src/objectId-parser.pipe"
import { BodyCommentModel } from "../models/body/BodyCommentModel"
import { DeviceSessionModel } from "../models/request/device-session.model"
import { CommentsService } from "../services/comments.service"
import { ErrorEnums } from "../utils/errors/errorEnums"
import { BodyLikeModel } from "../models/body/BodyLikeModel"
import { ObjectIdCommentIdModel } from "../models/uri/ObjectId-commentId.model"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"
import { OptionalDeviceSessionModel } from "../models/request/optional-device-session.model"
import { AccessMiddleware } from "../guards/access.middleware"

@Controller("comments")
export class CommentsController {
  constructor(
    @Inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    @Inject(CommentsService) protected commentsService: CommentsService
  ) {
  }

  @UseGuards(AccessMiddleware)
  @Get(":id")
  async getComment(
    @Req() deviceSession: OptionalDeviceSessionModel,
    @Param("id") id: ObjectIdIdModel
  ) {
    const comment = await this.commentsQueryRepository.findComment(id.id, deviceSession.userId)
    if (comment === null) throw new NotFoundException()
    return
  }

  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() deviceSession: DeviceSessionModel,
    @Param("commentId") commentId: ObjectIdCommentIdModel,
    @Body() bodyComment: BodyCommentModel
  ) {
    const comment = await this.commentsService.updateComment(deviceSession.userId, commentId.commentId, bodyComment.content)
    if (comment.error === ErrorEnums.NOT_FOUND_COMMENT) throw new NotFoundException()
    if (comment.error === ErrorEnums.CANT_UPDATE_FOREIGN_COMMENT) throw new ForbiddenException()
    return
  }

  @Delete(":commentId")
  async deleteComment(
    @Req() deviceSession: DeviceSessionModel,
    @Param("commentId") commentId: ObjectIdCommentIdModel
  ) {
    const comment = await this.commentsService.deleteComment(deviceSession.userId, commentId.commentId)
    if (comment.error === ErrorEnums.NOT_FOUND_COMMENT) throw new NotFoundException()
    if (comment.error === ErrorEnums.CANT_DELETE_FOREIGN_COMMENT) throw new ForbiddenException()
    return
  }

  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @Req() deviceSession: DeviceSessionModel,
    @Param("commentId") commentId: ObjectIdCommentIdModel,
    @Body() bodyLike: BodyLikeModel
  ) {
    const comment = await this.commentsService.updateLike(deviceSession.userId, commentId.commentId, bodyLike.likeStatus)
    if (comment.error === ErrorEnums.NOT_FOUND_COMMENT) throw new NotFoundException()
    if (comment.error === ErrorEnums.CANT_UPDATE_FOREIGN_COMMENT) throw new ForbiddenException()
    return
  }
}
