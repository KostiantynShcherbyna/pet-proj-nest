import { Injectable } from "@nestjs/common"
import { ILike, Posts, PostsDocument, PostsModel } from "../../application/entites/mongoose/posts.schema"
import { InjectModel } from "@nestjs/mongoose"
import { Comments, CommentsModel } from "../../../comments/application/entities/mongoose/comments.schema"
import { BlogsRepository } from "../../../blogs/repository/mongoose/blogs.repository"
import { UsersRepository } from "../../../sa/repository/mongoose/users.repository"
import { Contract } from "../../../../infrastructure/utils/contract"
import {
  CreateBloggerPostOutputModel,
  PostsView
} from "../../../blogger/api/models/output/create-blogger-post.output-model"
import { GetPostsQueryInputModel } from "../../api/models/input/get-posts.query.input-model"
import { ErrorEnums } from "../../../../infrastructure/utils/error-enums"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT, SORT_BY_DEFAULT_SQL,
  SortDirection
} from "../../../../infrastructure/utils/constants"
import { dtoManager } from "../../../../infrastructure/adapters/output-model.adapter"
import { BlogsSqlRepository } from "../../../blogs/repository/sql/blogs.sql.repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"


@Injectable()
export class PostsSqlQueryRepository {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsSqlRepository: BlogsSqlRepository,
  ) {
  }


  async findPosts(queryPost: GetPostsQueryInputModel, userId?: string): Promise<Contract<null | PostsView>> {

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT_SQL
    const sortDirection = queryPost.sortDirection || SortDirection.Desc
    const offset = (pageNumber - 1) * pageSize

    const totalCount = await this.dataSource.query(`
    select count (*)
    from posts."Posts"
    `)

    const pagesCount = Math.ceil(totalCount / pageSize)

    const queryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName","BlogId" as "blogId", "CreatedAt" as "createdAt",
           b."LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           c."Status" as "myStatus",
           d."AddedAt" as "addedAt", "UserId" as "userId", "Login" as "login"
    from posts."Posts" a
    left join posts."ExtendedLikesInfo" b
    left join posts."Likes" c
    left join posts."NewestLikes" d
    order by "${sortBy}" ${
      sortBy !== "createdAt" ? "COLLATE 'C'" : ""
    } ${sortDirection}
    limit $1
    offset $2
    `

    const foundPosts = await this.dataSource.query(queryForm, [
      pageSize, // 1
      offset, // 2
    ])

    const mappedPosts = this.changePostsView(foundPosts, userId)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedPosts
    }

    return new Contract(postsView, null)
  }


  async findPost(postId: string, userId?: string): Promise<Contract<null | CreateBloggerPostOutputModel>> {

    const queryForm = `
    select a."PostId" as "postId", "Title" as "title", "ShortDescription" as "shortDescription", "Content" as "content",
             "BlogName" as "blogName","BlogId" as "blogId", "CreatedAt" as "createdAt",
           b."LikesCount" as "likesCount", "DislikesCount" as "dislikesCount",
           c."Status" as "myStatus",
           d."AddedAt" as "addedAt", "UserId" as "userId", "Login" as "login"
    from posts."Posts" a
    left join posts."ExtendedLikesInfo" b
    left join posts."Likes" c
    left join posts."NewestLikes" d
    where a."PostId" = $1
    `
    const foundPost = await this.dataSource.query(queryForm, [
      postId, // 1
    ])

    const postView = this.changePostView(foundPost)

    return new Contract(postView, null)
  }

  private changePostsView(posts: any[], userId?: string) {
    // const myStatus = (post: PostsDocument) => post.extendedLikesInfo.like.find(like => like.userId === userId)?.status
    //   || LikeStatus.None

    return posts.map(post => {
      return {
        id: post.postId,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesCount,
          dislikesCount: post.dislikesCount,
          myStatus: post.myStatus || LikeStatus.None,
          newestLikes: [],
        },
      }
    })
  }

  private changePostView(post: any) {
    return {
      id: post.postId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    }
  }


}