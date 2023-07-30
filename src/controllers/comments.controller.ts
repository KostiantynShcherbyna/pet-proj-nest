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
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { DeviceSessionOptional } from "src/decorators/device-session-optional.decorator"
import { DeviceSession } from "src/decorators/device-session.decorator"
import { AccessGuard } from "src/guards/access.guard"
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository"
import { DeleteCommentCommand } from "src/use-cases/comments/delete-comment.use-case"
import { UpdateCommentLikeCommand } from "src/use-cases/comments/update-comment-like.use-case"
import { UpdateCommentCommand } from "src/use-cases/comments/update-comment.use-case"
import { callErrorMessage } from "src/utils/managers/error-message.manager"
import { AccessMiddleware } from "../guards/access.middleware"
import { BodyCommentInputModel } from "../input-models/body/body-comment.input-model"
import { BodyLikeInputModel } from "../input-models/body/body-like.input-model"
import { DeviceSessionOptionalInputModel } from "../input-models/request/device-session-optional.input-model"
import { DeviceSessionInputModel } from "../input-models/request/device-session.input-model"
import { CommentIdInputModel } from "../input-models/uri/commentId.input-model"
import { IdInputModel } from "../input-models/uri/id.input-model"
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
    @Param() param: IdInputModel
  ) {
    const commentContract = await this.commentsQueryRepository.findComment(param.id, deviceSession?.userId)
    if (commentContract.error === ErrorEnums.USER_IS_BANNED) throw new NotFoundException(
      callErrorMessage(ErrorEnums.USER_IS_BANNED, "id")
    )
    if (commentContract.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "id")
    )
    return commentContract.data
  }

  @UseGuards(AccessGuard)
  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: CommentIdInputModel,
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
    if (comment.error === ErrorEnums.FOREIGN_COMMENT) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_COMMENT, "userId")
    )
    return
  }

  @UseGuards(AccessGuard)
  @Delete(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: CommentIdInputModel
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
    if (comment.error === ErrorEnums.FOREIGN_COMMENT) throw new ForbiddenException(
      callErrorMessage(ErrorEnums.FOREIGN_COMMENT, "userId")
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
    @DeviceSession() deviceSession: DeviceSessionInputModel,
    @Param() param: CommentIdInputModel,
    @Body() bodyLike: BodyLikeInputModel
  ) {
    const comment = await this.commandBus.execute(
      new UpdateCommentLikeCommand(
        deviceSession.userId,
        param.commentId,
        bodyLike.likeStatus,
      )
    )
    if (comment.error === ErrorEnums.USER_NOT_FOUND) throw new UnauthorizedException()
    if (comment.error === ErrorEnums.USER_IS_BANNED) throw new UnauthorizedException()
    if (comment.error === ErrorEnums.COMMENT_NOT_FOUND) throw new NotFoundException(
      callErrorMessage(ErrorEnums.COMMENT_NOT_FOUND, "commentId")
    )
    return
  }
}
