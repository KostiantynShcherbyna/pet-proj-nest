import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Comments, CommentsDocument, CommentsModel } from "src/schemas/comments.schema"

@Injectable()
export class CommentsRepository {
    constructor(
        @InjectModel(Comments.name) protected CommentsModel: CommentsModel
    ) { }

    async findComment(commentId: string) {

        const foundComment = await this.CommentsModel.findOne({ _id: new Types.ObjectId(commentId) })
        if (foundComment === null) return null

        return foundComment
    }

    async saveDocument(document: CommentsDocument) {
        await document.save()
    }

}
