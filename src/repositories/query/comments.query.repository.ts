import { Injectable, Inject } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogModel } from "src/models/query/QueryBlogModel"
import { blogView, blogsView } from "src/views/blogView"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { dtoModify } from "src/utils/modify/dtoModify"
import { Types } from "mongoose"
import { QueryPostModel } from "src/models/query/QueryPostModel"
import { postView, postsView } from "src/views/postView"
import { ILike, Posts, PostsModel } from "src/schemas/posts.schema"
import { MyStatus } from "src/utils/constants/constants"
import { QueryCommentModel } from "src/models/query/QueryCommentModel"
import { commentView, commentsView } from "src/views/commentView"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    ) { }

    async findComment(postCommentId: string, userId?: string): Promise<null | commentView> {

        const foundComment = await this.CommentsModel.findOne({ _id: new Types.ObjectId(postCommentId) })
        if (foundComment === null) return null

        // Looking for a Like if userId is defined
        let like: ILike | undefined
        if (userId) {
            like = foundComment.likesInfo.like.find(like => like.userId === userId)
        }

        // Mapping dto
        const commentView = dtoModify.changeCommentView(foundComment, like?.status || MyStatus.None)
        return commentView
    }


    async findComments(postId: string, query: QueryCommentModel, userId?: string): Promise<commentsView> {

        const PAGE_SIZE_DEFAULT = 10
        const PAGE_NUMBER_DEFAULT = 1
        const SORT_BY_DEFAULT = 'createdAt'
        const SORT_DIRECTION_DEFAULT = -1

        const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
        const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
        const sortBy = query.sortBy || SORT_BY_DEFAULT
        const sortDirection = query.sortDirection === "asc" ? 1 : SORT_DIRECTION_DEFAULT

        const skippedCommentsCount = (pageNumber - 1) * pageSize

        const totalCount = await this.CommentsModel.countDocuments({ postId: postId })

        const pagesCount = Math.ceil(totalCount / pageSize)


        const comments = await this.CommentsModel
            .find({ postId: postId })
            .sort({ [sortBy]: sortDirection })
            .limit(pageSize)
            .skip(skippedCommentsCount)
            .lean()

        // Mapping dto
        const mappedComments = dtoModify.changeCommentsView(comments, userId,)

        return {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: mappedComments
        }
    }

}