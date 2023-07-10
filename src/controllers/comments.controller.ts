import {
  Controller,
  Get,
  Param,
  Inject,
  NotFoundException, Put, Body, Req, ForbiddenException, HttpCode, HttpStatus, Delete
} from "@nestjs/common";
import { PostsQueryRepository } from "src/repositories/query/posts.query.repository";
import { PostsService } from "src/services/posts.service";
import { CommentsQueryRepository } from "src/repositories/query/comments.query.repository";
import ParseObjectIdPipe from "src/objectId-parser.pipe";
import { BodyCommentModel } from "../models/body/BodyCommentModel";
import { DeviceSessionModel } from "../models/request/DeviceSessionModel";
import { CommentsService } from "../services/comments.service";
import { errorMessages } from "../utils/errors/errorMessages";
import { ErrorEnums } from "../utils/errors/errorEnums";
import { BodyLikeModel } from "../models/body/BodyLikeModel";

@Controller("comments")
export class CommentsController {
  constructor(
    @Inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    @Inject(CommentsService) protected commentsService: CommentsService
  ) {
  }

  @Get(":id")
  async getComment(
    @Param("id", ParseObjectIdPipe) id: string
  ) {
    const comment = await this.commentsQueryRepository.findComment(id);
    if (comment === null) throw new NotFoundException();
    return;
  }


  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() deviceSession: DeviceSessionModel,
    @Param("commentId", ParseObjectIdPipe) commentId: string,
    @Body() bodyComment: BodyCommentModel
  ) {
    const comment = await this.commentsService.updateComment(deviceSession.userId, commentId, bodyComment.content);
    if (comment.error === ErrorEnums.NOT_FOUND_COMMENT) throw new NotFoundException();
    if (comment.error === ErrorEnums.CANT_UPDATE_FOREIGN_COMMENT) throw new ForbiddenException();
    return;
  }

  @Delete(":commentId")
  async deleteComment(
    @Req() deviceSession: DeviceSessionModel,
    @Param("commentId", ParseObjectIdPipe) commentId: string
  ) {
    const comment = await this.commentsService.deleteComment(deviceSession.userId, commentId);
    if (comment.error === ErrorEnums.NOT_FOUND_COMMENT) throw new NotFoundException();
    if (comment.error === ErrorEnums.CANT_DELETE_FOREIGN_COMMENT) throw new ForbiddenException();
    return;
  }

  @Put(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @Req() deviceSession: DeviceSessionModel,
    @Param("commentId", ParseObjectIdPipe) commentId: string,
    @Body() bodyLike: BodyLikeModel
  ) {
    const comment = await this.commentsService.updateLike(deviceSession.userId, commentId, bodyLike.likeStatus);
    if (comment.error === ErrorEnums.NOT_FOUND_COMMENT) throw new NotFoundException();
    if (comment.error === ErrorEnums.CANT_UPDATE_FOREIGN_COMMENT) throw new ForbiddenException();
    return
  }
}
