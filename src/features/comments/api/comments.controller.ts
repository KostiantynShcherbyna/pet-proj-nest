import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { AccessMiddleware } from "../../../infrastructure/guards/access-middleware.guard"
import { UpdateCommentBodyInputModel } from "./models/input/update-comment.body.input-model"
import { LikeStatusBodyInputModel } from "./models/input/like-status.body.input-model"
import { UpdateCommentParamInputModel } from "./models/input/update-comment.param.input-model"
import { ErrorEnums } from "../../../infrastructure/utils/error-enums"
import { DeviceSessionReqInputModel } from "./models/input/device-session.req.input-model"
import { DeviceSessionOptionalReqInputModel } from "./models/input/device-session-optional.req.input-model"
import { IdParamInputModel } from "./models/input/id.param.input-model"
import { CommentsQueryRepository } from "../../../repositories/comments/mongoose/comments.query.repository"
import { DeviceSessionOptional } from "../../../infrastructure/decorators/device-session-optional.decorator"
import { callErrorMessage } from "../../../infrastructure/adapters/exception-message.adapter"
import { AccessGuard } from "../../../infrastructure/guards/access.guard"
import { DeviceSession } from "../../../infrastructure/decorators/device-session.decorator"
import { UpdateCommentCommand } from "../application/use-cases/update-comment.use-case"
import { DeleteCommentCommand } from "../application/use-cases/delete-comment.use-case"
import { UpdateCommentLikeCommand } from "../application/use-cases/update-comment-like.use-case"

@Controller("comments")
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {
  }

  @UseGuards(AccessMiddleware)
  @Get(":id")
  async getComment(
    @DeviceSessionOptional() deviceSession: DeviceSessionOptionalReqInputModel,
    @Param() param: IdParamInputModel
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: UpdateCommentParamInputModel,
    @Body() bodyComment: UpdateCommentBodyInputModel
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: UpdateCommentParamInputModel
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
    @DeviceSession() deviceSession: DeviceSessionReqInputModel,
    @Param() param: UpdateCommentParamInputModel,
    @Body() bodyLike: LikeStatusBodyInputModel
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
