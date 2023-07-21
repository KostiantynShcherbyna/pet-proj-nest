import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { CommentsRepository } from "src/repositories/comments.repository"
import { CommentsModel } from "src/schemas/comments.schema"
import { ErrorEnums } from "src/utils/errors/error-enums"


@Injectable()
export class DeleteComment {
    constructor(
        protected CommentsModel: CommentsModel,
        protected commentsRepository: CommentsRepository,
    ) {
    }

    async execute(userId: string, commentId: string): Promise<Contract<null | boolean>> {
        // Looking for a comment and check owner
        const comment = await this.commentsRepository.findComment(commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
        if (comment.commentatorInfo.userId !== userId) return new Contract(null, ErrorEnums.FOREIGN_COMMENT_NOT_DELETED);

        const deleteCommentContract = await this.CommentsModel.deleteComment(commentId, this.CommentsModel)
        if (deleteCommentContract.data === 0) return new Contract(null, ErrorEnums.COMMENT_NOT_DELETE);

        return new Contract(true, null);
    }



}