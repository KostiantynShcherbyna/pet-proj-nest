import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Comments, CommentsDocument, CommentsModel } from "../../entities/mongoose/comments.schema"
import { Contract } from "../../../infrastructure/utils/contract"


@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel
  ) {
  }

  async findComment(commentId: string) {

    const foundComment = await this.CommentsModel.findOne({ _id: new Types.ObjectId(commentId) })
    if (foundComment === null) return null

    return foundComment
  }

  async findComments() {

    const commentsTotalCount = await this.CommentsModel.countDocuments()

    const comments = await this.CommentsModel.find()

    return new Contract({
      totalCount: commentsTotalCount,
      items: comments
    }, null)

  }

  async saveDocument(document: CommentsDocument) {
    await document.save()
  }
}
