import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject, ServiceUnavailableException } from '@nestjs/common';
import { PostsQueryRepository } from 'src/repositories/query/postsQuery.repository';
import { PostsService } from 'src/services/posts.service';
import { bodyPostModel } from 'src/models/body/bodyPostModel';
import { queryPostModel } from 'src/models/query/queryPostModel';
import { queryCommentModel } from 'src/models/query/queryCommentModel';
import { CommentsQueryRepository } from 'src/repositories/query/commentsQuery.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsModel } from 'src/schemas/posts.schema';
import { Blogs, BlogsModel } from 'src/schemas/blogs.schema';
import { Comments, CommentsModel } from 'src/schemas/comments.schema';

@Controller('testing')
export class CommentsController {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
  ) { }

  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData(
  ) {
    try {
      await Promise.all(
        [
          await this.BlogsModel.deleteMany({}),
          await this.PostsModel.deleteMany({}),
          await this.CommentsModel.deleteMany({}),
        ]
      )
    } catch (err) {
      throw new ServiceUnavailableException()
    }
  }

}
