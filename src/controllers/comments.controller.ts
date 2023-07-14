import {
  Controller,
  Get,
  Param,
  Inject,
  NotFoundException, Put, Body, Req, ForbiddenException, HttpCode, HttpStatus, Delete, UseGuards
} from "@nestjs/common"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { BodyCommentModel } from "../models/body/BodyCommentModel"
import { DeviceSessionModel } from "../models/request/device-session.model"
import { CommentsService } from "../services/comments.service"
import { ErrorEnums } from "../utils/errors/errorEnums"
import { BodyLikeModel } from "../models/body/BodyLikeModel"
import { ObjectIdCommentIdModel } from "../models/uri/ObjectId-commentId.model"
import { ObjectIdIdModel } from "../models/uri/ObjectId-id.model"
import { OptionalDeviceSessionModel } from "../models/request/optional-device-session.model"
import { AccessMiddleware } from "../guards/access.middleware"
import { callErrorMessage } from "src/utils/errors/callErrorMessage"

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
    @Param() params: ObjectIdIdModel
  ) {
    const comment = await this.commentsQueryRepository.findComment(params.id, deviceSession.userId)
    if (comment === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "id")
    )
    return
  }

  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() deviceSession: DeviceSessionModel,
    @Param() params: ObjectIdCommentIdModel,
    @Body() bodyComment: BodyCommentModel
  ) {
    const comment = await this.commentsService.updateComment(deviceSession.userId, params.commentId, bodyComment.content)
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    if (comment.error === ErrorEnums.FOREIGN_COMMENT_NOT_UPDATED) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_COMMENT_NOT_UPDATED, "userId")
    )
    return
  }

  @Delete(":commentId")
  async deleteComment(
    @Req() deviceSession: DeviceSessionModel,
    @Param() params: ObjectIdCommentIdModel
  ) {
    const comment = await this.commentsService.deleteComment(deviceSession.userId, params.commentId)
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    if (comment.error === ErrorEnums.FOREIGN_COMMENT_NOT_DELETED) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_COMMENT_NOT_DELETED, "userId")
    )
    if (comment.error === ErrorEnums.COMMENT_NOT_DELETE) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_DELETE, "commentId")
    )
    return
  }

  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @Req() deviceSession: DeviceSessionModel,
    @Param() params: ObjectIdCommentIdModel,
    @Body() bodyLike: BodyLikeModel
  ) {
    const comment = await this.commentsService.updateLike(deviceSession.userId, params.commentId, bodyLike.likeStatus)
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    return
  }
}
