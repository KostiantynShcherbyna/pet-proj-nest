import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogInputModel } from "src/input-models/query/query-blog.input-model"
import { BlogView, BlogsView } from "src/views/blog.view"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { dtoManager } from "src/utils/managers/dto.manager"
import { Types } from "mongoose"
import { QueryPostInputModel } from "src/input-models/query/query-post.input-model"
import { PostView, PostsView } from "src/views/post.view"
import { ILike, Posts, PostsModel } from "src/schemas/posts.schema"
import {
  LikeStatus,
  PAGE_NUMBER_DEFAULT,
  PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT,
  SORT_DIRECTION_DEFAULT,
  SortDirection
} from "src/utils/constants/constants"
import { Contract } from "src/contract"
import { ErrorEnums } from "src/utils/errors/error-enums"
import { Comments, CommentsModel } from "src/schemas/comments.schema"
import { UsersRepository } from "../users.repository"

// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    protected blogsRepositoryMngs: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }


  async findPosts(queryPost: QueryPostInputModel, userId?: string, blogId?: string,): Promise<Contract<null | PostsView>> {

    if (blogId) {
      const blog = await this.blogsRepositoryMngs.findBlog(blogId)
      if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    }

    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT
    const sortDirection = queryPost.sortDirection === SortDirection.Asc
      ? 1
      : -1
    const skippedPostsCount = (pageNumber - 1) * pageSize


    const bannedUsers = await this.usersRepository.findBannedUsers()
    const bannedUserIds = bannedUsers.map(user => user._id.toString())

    // const totalCount = blogId
    //   ? await this.PostsModel.countDocuments({ $and: [{ blogId: blogId }, { "extendedLikesInfo.like.userId": { $nin: bannedUserIds } }] })
    //   : await this.PostsModel.countDocuments({ "extendedLikesInfo.like.userId": { $nin: bannedUserIds } })

    const totalCount = blogId
      ? await this.PostsModel.countDocuments({ blogId: blogId })
      : await this.PostsModel.countDocuments()



    // const totalCount = this.PostsModel.aggregate([
    //   // Разворачиваем массив "likes" для дальнейшей обработки
    //   { $unwind: '$extendedLikesInfo.like' },

    //   // Фильтруем документы, у которых "userId" из "likes" отсутствует в массиве "notLikes"
    //   { $match: { 'extendedLikesInfo.like.userId': { $nin: bannedUserIds } } },

    //   // Группируем обратно по _id для подсчета количества документов
    //   { $group: { _id: '$_id', count: { $sum: 1 } } }
    // ]).count.length



    const foundPosts = blogId
      ? await this.PostsModel
        .find({ blogId: blogId })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedPostsCount)
        .lean()
      : await this.PostsModel
        .find({})
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedPostsCount)
        .lean()


    const truePosts = foundPosts.map(post => {
      let likesCount: number = 0
      let dislikesCount: number = 0

      const trueLikes = post.extendedLikesInfo.like.filter(like => {
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCount++
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCount++
        return !bannedUserIds.includes(like.userId)
      })

      const trueNewestLikes = post.extendedLikesInfo.newestLikes.filter(newestLike => {
        return !bannedUserIds.includes(newestLike.userId)
      })

      const postCopy = { ...post }
      postCopy.extendedLikesInfo.likesCount -= likesCount
      postCopy.extendedLikesInfo.dislikesCount -= dislikesCount
      postCopy.extendedLikesInfo.like = trueLikes
      postCopy.extendedLikesInfo.newestLikes = trueNewestLikes

      return postCopy
    })


    const pagesCount = Math.ceil(totalCount / pageSize)


    const mappedPosts = dtoManager.changePostsView(truePosts, userId)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedPosts
    }

    return new Contract(postsView, null)
  }



  async findBloggerPosts(queryPost: QueryPostInputModel, userId: string, blogId: string,): Promise<Contract<null | PostsView>> {

    const blog = await this.blogsRepositoryMngs.findBlog(blogId)
    if (blog === null) return new Contract(null, ErrorEnums.BLOG_NOT_FOUND)
    if (blog.blogOwnerInfo.userId !== userId) return new Contract(null, ErrorEnums.FOREIGN_BLOG);


    const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
    const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = queryPost.sortBy || SORT_BY_DEFAULT
    const sortDirection = queryPost.sortDirection === SortDirection.Asc
      ? 1
      : -1
    const skippedPostsCount = (pageNumber - 1) * pageSize

    const totalCount = blogId
      ? await this.PostsModel.countDocuments({ blogId: blogId })
      : await this.PostsModel.countDocuments({})

    const pagesCount = Math.ceil(totalCount / pageSize)


    const foundPosts = blogId
      ? await this.PostsModel
        .find({ blogId: blogId })
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedPostsCount)
        .lean()
      : await this.PostsModel
        .find({})
        .sort({ [sortBy]: sortDirection })
        .limit(pageSize)
        .skip(skippedPostsCount)
        .lean()


    const bannedUsers = await this.usersRepository.findBannedUsers()
    const bannedUserIds = bannedUsers.map(user => user._id.toString())

    const truePosts = foundPosts.map(post => {
      let likesCount: number = 0
      let dislikesCount: number = 0

      const trueLikes = post.extendedLikesInfo.like.filter(like => {
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Like) likesCount++
        if (bannedUserIds.includes(like.userId) && like.status === LikeStatus.Dislike) dislikesCount++
        return !bannedUserIds.includes(like.userId)
      })

      post.extendedLikesInfo.likesCount - likesCount
      post.extendedLikesInfo.dislikesCount - dislikesCount

      const trueNewestLikes = post.extendedLikesInfo.newestLikes.filter(newestLike => {
        return !bannedUserIds.includes(newestLike.userId)
      })

      return {
        ...post,
        extendedLikesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          like: trueLikes,
          newestLikes: trueNewestLikes
        }
      }

    })


    const mappedPosts = dtoManager.changePostsView(truePosts, userId)

    const postsView = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedPosts
    }

    return new Contract(postsView, null)
  }



  async findPost(postId: string, userId?: string): Promise<null | PostView> {

    const foundPost = await this.PostsModel.findById(postId)
    if (foundPost === null) return null

    // Looking for a Like if userId is defined
    let like: ILike | undefined
    if (userId) like = foundPost.extendedLikesInfo.like.find(like => like.userId === userId)

    const postView = dtoManager.changePostView(foundPost, like?.status || LikeStatus.None)

    return postView
  }


}