import { Injectable } from "@nestjs/common"
import { Contract } from "../../../../infrastructure/utils/contract"
import { GetCommentsOutputModel } from "../../api/models/output/get-comments.output-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT_SQL,
  SortDirection
} from "../../../../infrastructure/utils/constants"
import { GetPostsCommentsQueryInputModel } from "../../../blogs/api/models/input/get-posts-comments.query.input-model"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { UsersRepositoryOrm } from "../../../sa/repository/typeorm/users.repository.orm"
import { PostsQueryRepositoryOrm } from "../../../posts/repository/typeorm/posts.query.repository.orm"


@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersSqlRepository: UsersRepositoryOrm,
    protected postsQueryRepositorySql: PostsQueryRepositoryOrm,
  ) {
  }

  async findAllBlogComments(query: GetPostsCommentsQueryInputModel, userId: string) {

    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortDirection = query.sortDirection || SortDirection.Desc
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const offset = (pageNumber - 1) * pageSize

    const commentsTotalCount = await this.dataSource.query(`
    select count(*)
    from public."comment_entity" a
    left join public."post_entity" b on b."PostId" = a."PostId"
    left join public."blog_entity" c on c."BlogId" = b."BlogId"
    where c."UserId" = $1
    `, [userId])

    const pagesCount = Math.ceil(commentsTotalCount[0].count / pageSize)

    const queryForm = `
    select a."CommentId" as "id", a."Content" as "content", a."CreatedAt" as "createdAt",
           a."UserId" as "userId", a."UserLogin" as "userLogin",
           b."PostId" as "postId", b."Title" as "title", b."BlogId" as "blogId", b."BlogName" as "blogName",
           (select "Status" from public."comment_like_entity" where "CommentId" = a."CommentId" and "UserId" = $1) as "myStatus",
           (
            select count(*)
            from public."comment_like_entity" a
            left join public."comment_entity" b on b."CommentId" = a."CommentId"
            left join public."post_entity" c on c."PostId" = b."PostId"
            left join public."ban_info_entity" d on d."UserId" = a."UserId"
            left join public."blog_entity" e on e."BlogId" = c."BlogId"
            where a."Status" = 'Like'
            and d."IsBanned" = 'false'
            and e."UserId" = $1
           ) as "likesCount", 
           (
            select count(*)
            from public."comment_like_entity" a
            left join public."comment_entity" b on b."CommentId" = a."CommentId"
            left join public."post_entity" c on c."PostId" = b."PostId"
            left join public."ban_info_entity" d on d."UserId" = a."UserId"
            left join public."blog_entity" e on e."BlogId" = c."BlogId"
            where a."Status" = 'Dislike'
            and d."IsBanned" = 'false'
            and e."UserId" = $1
           ) as "dislikesCount"
    from public."comment_entity" a
    left join public."post_entity" b on b."PostId" = a."PostId"
    left join public."blog_entity" c on c."BlogId" = b."BlogId"
    where c."UserId" = $1
    order by a."${sortBy}" ${
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
      totalCount: Number(commentsTotalCount[0].count),
      items: blogCommentsView
    }
  }


  async findComments({ postId, query, userId }) {

    const foundPost = await this.postsQueryRepositorySql.findPost(postId, userId)
    if (!foundPost) return new Contract(null, ErrorEnums.POST_NOT_FOUND)

    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count (*)
    from public."comment_entity" a
    where a."PostId" = $1
    `, [postId])

    const pagesCount = Math.ceil(totalCount[0].count / pageSize)

    const queryForm = `
     select a."PostId" as "postId", a."Content" as "content", a."CreatedAt" as "createdAt",
            a."CommentId" as "commentId", a."UserId" as "userId", a."UserLogin" as "userLogin", 
            (select "Status" from public."comment_like_entity" where"CommentId" = a."CommentId" and "UserId" = $2) as "myStatus",
            (
            select count(*)
            from public."comment_like_entity" u
            left join public."ban_info_entity" d on d."UserId" = u."UserId"
            where u."Status" = 'Like'
            and d."IsBanned" = 'false'
            and a."CommentId" = u."CommentId"
            ) as "likesCount", 
            (
            select count(*)
            from public."comment_like_entity" u
            left join public."ban_info_entity" d on d."UserId" = u."UserId"
            where u."Status" = 'Dislike'
            and d."IsBanned" = 'false'
            and a."CommentId" = u."CommentId"
            ) as "dislikesCount"
    from public."comment_entity" a
    where a."PostId" = $1
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE \"C\"" : ""
    } ${sortDirection}
    limit $3
    offset $4
    `

    const comments = await this.dataSource.query(queryForm, [postId, userId, pageSize, offset])
    const commentsView = this.postCommentsView(comments)

    return new Contract({
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items: commentsView
    }, null)
  }

  async findComment({ commentId, userId }) {

    const queryForm = `
    select "PostId" as "postId", "Content" as "content", "CreatedAt" as "createdAt",
           a."CommentId" as "commentId", a."UserId" as "userId", "UserLogin" as "userLogin",
           (
           select "Status"
           from public."comment_like_entity"
           where "CommentId" = a."CommentId"
           and "UserId" = $2
           ) as "myStatus",
           (
           select count(*)
           from public."comment_like_entity" a
           left join public."ban_info_entity" b on b."UserId" = a."UserId"
           where "CommentId" = $1
           and "Status" = 'Like'
           and b."IsBanned" = 'false'
           ) as "likesCount", 
           (
           select count(*)
           from public."comment_like_entity" a
           left join public."ban_info_entity" b on b."UserId" = a."UserId"
           where "CommentId" = $1
           and "Status" = 'Dislike'
           and b."IsBanned" = 'false'
           ) as "dislikesCount"
    from public."comment_entity" a
    where a."CommentId" = $1
    `
    const commentResult = await this.dataSource.query(queryForm, [commentId, userId])

    const queryFormBanInfo = `
    select "IsBanned" as "isBanned", "BanReason" as "banReason", "UserId" as "UserId", "BanDate" as "banDate"
    from public."ban_info_entity"
    where "UserId" = $1
    `
    if (!commentResult.length) return new Contract(null, ErrorEnums.COMMENT_NOT_FOUND)
    const banInfoResult = await this.dataSource.query(queryFormBanInfo, [commentResult[0].userId])
    if (banInfoResult[0].isBanned === true) return new Contract(null, ErrorEnums.USER_IS_BANNED)

    return new Contract(this.changeCommentView(commentResult[0]), null)
  }


  private blogCommentsView(comments: any[]) {

    return comments.map(comment => {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
          myStatus: comment.myStatus || LikeStatus.None,
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
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
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
        likesCount: Number(comment.likesCount),
        dislikesCount: Number(comment.dislikesCount),
        myStatus: comment.myStatus || LikeStatus.None,
      },
    }
  }


}