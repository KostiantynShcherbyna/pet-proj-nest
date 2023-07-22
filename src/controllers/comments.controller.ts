import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode, HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSessionOptional } from "src/decorators/device-session-optional.decorator"
import { DeviceSessionDecorator } from "src/decorators/device-session.decorator"
import { AccessGuard } from "src/guards/access.guard"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { DeleteCommentCommand } from "src/services/use-cases/comments/delete-comment.use-case"
import { UpdateCommentLikeCommand } from "src/services/use-cases/comments/update-comment-like.use-case"
import { UpdateCommentCommand } from "src/services/use-cases/comments/update-comment.use-case"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { AccessMiddleware } from "../guards/access.middleware"
import { BodyCommentInputModel } from "../input-models/body/body-comment.input-model"
import { BodyLikeInputModel } from "../input-models/body/body-like.input-model"
import { DeviceSessionOptionalInputModel } from "../input-models/request/device-session-optional.input-model"
import { DeviceSessionInputModel } from "../input-models/request/device-session.input-model"
import { ObjectIdCommentIdInputModel } from "../input-models/uri/commentId.input-model"
import { ObjectIdIdInputModel } from "../input-models/uri/id.input-model"
import { CommentsService } from "../services/comments.service"
import { ErrorEnums } from "../utils/errors/error-enums"

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
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalInputModel,
    @Param() param: ObjectIdIdInputModel
  ) {
    const commentView = await this.commentsQueryRepository.findComment(param.id, deviceSession?.userId)
    if (commentView === null) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "id")
    )
    return commentView
  }

  @UseGuards(AccessGuard)
  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @DeviceSessionDecorator() deviceSession: DeviceSessionInputModel,
    @Param() param: ObjectIdCommentIdInputModel,
    @Body() bodyComment: BodyCommentInputModel
  ) {
    const comment = await this.commandBus.execute(
      new UpdateCommentCommand(
        deviceSession.userId,
        param.commentId,
        bodyComment.content
      )
    )
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
    @DeviceSessionDecorator() deviceSession: DeviceSessionInputModel,
    @Param() param: ObjectIdCommentIdInputModel
  ) {
    const comment = await this.commandBus.execute(
      new DeleteCommentCommand(
        deviceSession.userId,
        param.commentId,
      )
    )
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
    @DeviceSessionDecorator() deviceSession: DeviceSessionInputModel,
    @Param() param: ObjectIdCommentIdInputModel,
    @Body() bodyLike: BodyLikeInputModel
  ) {
    const comment = await this.commandBus.execute(
      new UpdateCommentLikeCommand(
        deviceSession.userId,
        param.commentId,
        bodyLike.likeStatus,
      )
    )
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    return
  }
}
