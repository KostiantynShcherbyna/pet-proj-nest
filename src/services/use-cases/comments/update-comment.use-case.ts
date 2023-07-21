import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { CommentsRepository } from "src/repositories/comments.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"


@Injectable()
export class UpdateComment {
    constructor(
        protected commentsRepository: CommentsRepository,
    ) {
    }

    async execute(userId: string, commentId: string, content: string): Promise<Contract<null | boolean>> {
        // Looking for a comment and check owner
        const comment = await this.commentsRepository.findComment(commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
        if (comment.checkCommentator(userId) === false) return new Contract(null, ErrorEnums.FOREIGN_COMMENT_NOT_UPDATED);

        comment.updateComment(content);
        await this.commentsRepository.saveDocument(comment);

        return new Contract(true, null);
    }


}