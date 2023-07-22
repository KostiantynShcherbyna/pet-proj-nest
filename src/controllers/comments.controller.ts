import {
  Controller,
  Get,
  Param,
  Inject,
  NotFoundException, Put, Body, Req, ForbiddenException, HttpCode, HttpStatus, Delete, UseGuards
} from "@nestjs/common"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { BodyCommentModel } from "../models/body/body-comment.model"
import { DeviceSessionModel } from "../models/request/device-session.model"
import { CommentsService } from "../services/comments.service"
import { ErrorEnums } from "../utils/errors/error-enums"
import { BodyLikeModel } from "../models/body/body-like.model"
import { ObjectIdCommentIdModel } from "../models/uri/commentId.model"
import { ObjectIdIdModel } from "../models/uri/id.model"
import { OptionalDeviceSessionModel } from "../models/request/optional-device-session.model"
import { AccessMiddleware } from "../guards/access.middleware"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { AccessGuard } from "src/guards/access.guard"
import { UpdateCommentCommand } from "src/services/use-cases/comments/update-comment.use-case"
import { DeleteCommentCommand } from "src/services/use-cases/comments/delete-comment.use-case"
import { UpdateCommentLikeCommand } from "src/services/use-cases/comments/update-comment-like.use-case"
import { CommandBus } from "@nestjs/cqrs"

@Controller("comments")
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService
  ) {
  }

  @UseGuards(AccessMiddleware)
  @Get(":id")
  async getComment(
    @Req() req: Request & { deviceSession: OptionalDeviceSessionModel },
    @Param() param: ObjectIdIdModel
  ) {
    const commentView = await this.commentsQueryRepository.findComment(param.id, req.deviceSession?.userId)
    if (commentView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "id")
    )
    return commentView
  }

  @UseGuards(AccessGuard)
  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() req: Request & { deviceSession: DeviceSessionModel },
    @Param() param: ObjectIdCommentIdModel,
    @Body() bodyComment: BodyCommentModel
  ) {
    const comment = await this.commandBus.execute(new UpdateCommentCommand(req.deviceSession.userId, param.commentId, bodyComment.content))
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    if (comment.error === ErrorEnums.FOREIGN_COMMENT_NOT_UPDATED) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_COMMENT_NOT_UPDATED, "userId")
    )
    return
  }

  @UseGuards(AccessGuard)
  @Delete(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Req() req: Request & { deviceSession: DeviceSessionModel },
    @Param() param: ObjectIdCommentIdModel
  ) {
    const comment = await this.commandBus.execute(new DeleteCommentCommand(req.deviceSession.userId, param.commentId))
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    if (comment.error === ErrorEnums.FOREIGN_COMMENT_NOT_DELETED) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_COMMENT_NOT_DELETED, "userId")
    )
    if (comment.error === ErrorEnums.COMMENT_NOT_DELETE) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_DELETE, "commentId")
    )
    return
  }

  @UseGuards(AccessGuard)
  @Put(":commentId/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @Req() req: Request & { deviceSession: DeviceSessionModel },
    @Param() param: ObjectIdCommentIdModel,
    @Body() bodyLike: BodyLikeModel
  ) {
    const comment = await this.commandBus.execute(new UpdateCommentLikeCommand(req.deviceSession.userId, param.commentId, bodyLike.likeStatus))
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    return
  }
}
