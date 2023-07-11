import { Injectable, Inject } from "@nestjs/common"
import { BlogsRepository } from "../blogs.repository"
import { InjectModel } from "@nestjs/mongoose"
import { QueryBlogModel } from "src/models/query/QueryBlogModel"
import { BlogView, BlogsView } from "src/views/BlogView"
import { BlogsModel, Blogs } from "src/schemas/blogs.schema"
import { dtoModify } from "src/utils/modify/dtoModify"
import { Types } from "mongoose"
import { QueryPostModel } from "src/models/query/QueryPostModel"
import { PostView, PostsView } from "src/views/PostView"
import { ILike, Posts, PostsModel } from "src/schemas/posts.schema"
import { MyStatus } from "src/utils/constants/constants"
// import { Posts, PostsModel } from "src/schemas/posts.schema"

@Injectable()
export class PostsQueryRepository {
    constructor(
        @InjectModel(Posts.name) protected PostsModel: PostsModel,
        @Inject(BlogsRepository) protected blogsRepositoryMngs: BlogsRepository
    ) { }

    async findPosts(queryPost: QueryPostModel, blogId?: string, userId?: string): Promise<null | PostsView> {

        if (blogId) {
            const blog = await this.blogsRepositoryMngs.findBlog(blogId)
            if (blog === null) return null
        }

        const PAGE_SIZE_DEFAULT = 10
        const PAGE_NUMBER_DEFAULT = 1
        const SORT_BY_DEFAULT = 'createdAt'
        const SORT_DIRECTION_DEFAULT = -1

        const pageSize = +queryPost.pageSize || PAGE_SIZE_DEFAULT
        const pageNumber = +queryPost.pageNumber || PAGE_NUMBER_DEFAULT
        const sortBy = queryPost.sortBy || SORT_BY_DEFAULT
        const sortDirection = queryPost.sortDirection === "asc" ? 1 : SORT_DIRECTION_DEFAULT

        const skippedPostsCount = (pageNumber - 1) * pageSize

        const totalCount = blogId ?
            await this.PostsModel.countDocuments({ blogId: blogId })
            : await this.PostsModel.countDocuments({})

        const pagesCount = Math.ceil(totalCount / pageSize)

        const foundPosts = blogId ?
            await this.PostsModel
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


        const mappedPosts = dtoModify.changePostsViewMngs(foundPosts, userId)

        const postsView = {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: mappedPosts
        }

        return postsView
    }

    async findPost(postId: string, userId?: string): Promise<null | PostView> {

        const foundPost = await this.PostsModel.findById(postId)
        if (foundPost === null) return null

        // Looking for a Like if userId is defined
        let like: ILike | undefined
        if (userId) like = foundPost.extendedLikesInfo.like.find(like => like.userId === userId)

        const postView = dtoModify.changePostViewMngs(foundPost, like?.status || MyStatus.None)

        return postView
    }


}