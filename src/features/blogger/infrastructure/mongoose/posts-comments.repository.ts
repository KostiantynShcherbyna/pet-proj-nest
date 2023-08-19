import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
  PostsComments,
  PostsCommentsDocument,
  PostsCommentsModel
} from "../../application/entities/mongoose/posts-comments.schema"


@Injectable()
export class PostsCommentsRepository {
  constructor(
    @InjectModel(PostsComments.name) protected PostsCommentsModel: PostsCommentsModel
  ) {
  }

  async findPostComment(commentId: string) {
    const postComment = await this.PostsCommentsModel.findOne({ commentId: commentId })
    if (postComment === null) return null
    return postComment
  }

  async findPostComments(searchData: any) {
    const postComments = await this.PostsCommentsModel.find({ [searchData[0]]: searchData[1] })
    return postComments
  }

  async findPostsComments(blogIds: any) {
    const postComments = await this.PostsCommentsModel.find({ "postInfo.blogId": { $in: { blogIds } } })
    return postComments
  }

  async saveDocument(document: PostsCommentsDocument) {
    await document.save()
  }
}
