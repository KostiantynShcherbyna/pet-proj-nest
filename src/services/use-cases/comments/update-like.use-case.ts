import { Injectable } from "@nestjs/common"
import { Contract } from "src/contract"
import { CommentsRepository } from "src/repositories/comments.repository"
import { ErrorEnums } from "src/utils/errors/error-enums"

@Injectable()
export class UpdateLike {
    constructor(
        protected commentsRepository: CommentsRepository,
    ) {
    }

    async execute(userId: string, commentId: string, newLikeStatus: string): Promise<Contract<boolean | null>> {

        const comment = await this.commentsRepository.findComment(commentId);
        if (comment === null) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND);
        // Create a new Like if there is no Like before or update Like if there is one
        comment.createOrUpdateLike(userId, newLikeStatus);
        await this.commentsRepository.saveDocument(comment);

        return new Contract(true, null);
    }


}