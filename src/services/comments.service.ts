import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Contract } from "src/contracts/Contract";
import { CommentsRepository } from "src/repositories/comments.repository";
import { Comments, CommentsModel } from "src/schemas/comments.schema";
import { ErrorEnums } from "src/utils/errors/errorEnums";


@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @Inject(CommentsRepository) protected commentsRepository: CommentsRepository
  ) {
  }

  async updateComment(userId: string, commentId: string, content: string): Promise<Contract<null | boolean>> {
    // Looking for a comment and check owner
    const comment = await this.commentsRepository.findComment(commentId);
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
    if (comment.checkCommentator(userId) === false) return new Contract(null, ErrorEnums.FOREIGN_COMMENT_NOT_UPDATED);

    comment.updateComment(content);
    await this.commentsRepository.saveDocument(comment);

    return new Contract(true, null);
  }


  async deleteComment(userId: string, commentId: string): Promise<Contract<null | boolean>> {
    // Looking for a comment and check owner
    const comment = await this.commentsRepository.findComment(commentId);
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
    if (comment.commentatorInfo.userId !== userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT_NOT_DELETED);

    const deleteCommentResult = await this.CommentsModel.deleteOne({ _id: new Types.ObjectId(commentId) });
    if (deleteCommentResult.deletedCount) return new Contract(null, ErrorEnums.COMMENT_NOT_DELETE);

    return new Contract(true, null);
  }


  async updateLike(userId: string, commentId: string, newLikeStatus: string): Promise<Contract<boolean | null>> {

    const comment = await this.commentsRepository.findComment(commentId);
    if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
    // Create a new Like if there is no Like before or update Like if there is one
    comment.createOrUpdateLike(userId, newLikeStatus);
    await this.commentsRepository.saveDocument(comment);

    return new Contract(true, null);
  }

}

