import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { PostsQueryRepository } from "../../../posts/repository/mongoose/posts.query.repository"
import { UsersRepository } from "../../../sa/repository/mongoose/users.repository"
import { Comments, CommentsDocument, CommentsModel, ILike } from "../../application/entities/mongoose/comments.schema"
import { Contract } from "../../../../infrastructure/utils/contract"
import { CommentsView, GetCommentsOutputModel } from "../../api/models/output/get-comments.output-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT, SORT_BY_DEFAULT_SQL, SortDirection
} from "../../../../infrastructure/utils/constants"
import { dtoManager } from "../../../../infrastructure/adapters/output-model.adapter"
import { GetCommentsQueryInputModel } from "../../api/models/input/get-comments.query.input-model"
import { PostsCommentsDocument } from "../../../posts/application/entites/mongoose/posts-comments.schema"
import { GetPostsCommentsQueryInputModel } from "../../../blogs/api/models/input/get-posts-comments.query.input-model"
import { BlogsOutputModel } from "../../../blogger/api/models/output/create-blogger-blog.output-model"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { BlogsRepositorySql } from "../../../blogs/repository/sql/blogs.repository.sql"
import { UsersRepositorySql } from "../../../sa/repository/sql/users.repository.sql"
import { PostsQueryRepositorySql } from "../../../posts/repository/sql/posts.query.repository.sql"


@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersSqlRepository: UsersRepositorySql,
    protected postsQueryRepositorySql: PostsQueryRepositorySql,
  ) {
  }

  async findAllBlogComments(query: GetPostsCommentsQueryInputModel, userId: string) {

    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection || SortDirection.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const blogsTotalCount = await this.dataSource.query(`
    select count(*)
    from comments."Comments" a on a."PostId" = b."PostId"
    left join posts."Posts" b on b."BlogId" = c."BlogId"
    left join blogs."Blogs" c
    where c."UserId" = $1
    `, [userId])

    const pagesCount = Math.ceil(blogsTotalCount[0].count / pageSize)

    const queryForm = `
    select a."CommentId" as "commentId", a."Content" as "content", a."CreatedAt" as "createdAt",
           a."UserId" as "userId", a."UserLogin" as "userLogin",
           a."LikesCount" as "likesCount", a."DislikesCount" as "dislikesCount",
           b."Status" as "myStatus",
           c."PostId" as "postId", c."Title" as "title", c."BlogId" as "blogId", c."BlogName" as "blogName"
    from comments."Comments" a on a."PostId" = b."PostId"
    left join comments."Likes" b on b."CommentId" = a."CommentId"
    left join posts."Posts" c on c."BlogId" = d."BlogId"
    left join blogs."Blogs" d
    where d."UserId" = $1
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $2
    offset $3
    `

    const comments = await this.dataSource.query(
      queryForm, [
        userId, // 1
        pageSize, // 2
        offset, // 3
      ])
    const blogCommentsView = this.blogCommentsView(comments)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(blogsTotalCount[0].count),
      items: blogCommentsView
    }
  }

  async findComment({ commentId, userId }) {
    const queryForm = `
    select "PostId" as "postId", "Content" as "content", "CreatedAt" as "createdAt",
           a."CommentId" as "commentId", a."UserId" as "userId", "UserLogin" as "userLogin",
           "LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
         b."Status" as "myStatus"
    from comments."Comments" a
    left join comments."Likes" b on b."CommentId" = a."CommentId"
    where a."CommentId" = $1
    and b."UserId" = $2
    `
    const commentResult = await this.dataSource.query(queryForm, [commentId, userId])

    const queryForm1 = `
    select "IsBanned" as "isBanned", "BanReason" as "banReason", "UserId" as "UserId", "BanDate" as "banDate"
    from users."BanInfo"
    where "UserId" = $1
    `
    const banInfoResult = await this.dataSource.query(queryForm1, [commentResult[0].userId])
    if (banInfoResult[0].isBanned === true) return new Contract(null, ErrorEnums.USER_IS_BANNED)
    return commentResult.length
      ? new Contract(this.changeCommentView(commentResult[0]), null)
      : new Contract(null, null)
  }

  async findComments({ postId, query, userId }) {

    const foundPost = await this.postsQueryRepositorySql.findPost(postId, userId)
    if (!foundPost) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count (*)
    from comments."Comments" a
    where a."PostId" = $1
    `[postId])

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
    select "PostId" as "postId", "Content" as "content", "CreatedAt" as "createdAt",
           "CommentId" as "commentId", "UserId" as "userId", "UserLogin" as "userLogin",
           "LikesCount" as "likesCount", "DislikesCount" as "dislikesCount"
    from comments."Comments"
    where "PostId" = $1
    order by "${sortBy}" ${
        sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $2
    offset $3
    `

    const comments = await this.dataSource.query(queryForm, [postId, pageSize, offset])
    const commentsView = this.postCommentsView(comments)

    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items: commentsView
    }, null)
  }


  private blogCommentsView(comments: any[]) {

    return comments.map(comment => {
      return {
        id: comment.commentId,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesCount,
          dislikesCount: comment.dislikesCount,
          myStatus: comment.myStatus,
        },
        postInfo: {
          id: comment.postId,
          title: comment.title,
          blogId: comment.blogId,
          blogName: comment.blogName,
        }
      }
    })
  }

  private postCommentsView(comments: any[]): GetCommentsOutputModel[] {
    // Looking for a myStatus of Like in each comment

    return comments.map(comment => {
      return {
        id: comment.commentId,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesCount,
          dislikesCount: comment.dislikesCount,
          myStatus: comment.myStatus || LikeStatus.None,
        },
      }
    })
  }

  private changeCommentView(comment: any): GetCommentsOutputModel {
    return {
      id: comment.commentId,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: comment.myStatus || LikeStatus.None,
      },
    }
  }


}