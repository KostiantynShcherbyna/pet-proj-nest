import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject } from '@nestjs/common';
import { PostsQueryRepository } from 'src/repositories/query/postsQuery.repository';
import { PostsService } from 'src/services/posts.service';
import { bodyPostModel } from 'src/models/body/bodyPostModel';
import { queryPostModel } from 'src/models/query/queryPostModel';
import { queryCommentModel } from 'src/models/query/queryCommentModel';
import { CommentsQueryRepository } from 'src/repositories/query/commentsQuery.repository';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository) protected PostsQueryRepository: PostsQueryRepository,
    @Inject(PostsService) protected PostsService: PostsService,
    @Inject(CommentsQueryRepository) protected CommentsQueryRepository: CommentsQueryRepository,
  ) { }

  @Get()
  async findPosts(
    @Query() queryPostModel: queryPostModel,
  ) {
    return await this.PostsQueryRepository.findPosts(queryPostModel)
  }

  @Get(':id')
  async findPost(
    @Param() id: string,
  ) {
    const post = await this.PostsQueryRepository.findPost(id)
    if (post === null) throw new NotFoundException()
    return post
  }

  @Post()
  async createPost(
    @Body() bodyPostModel: bodyPostModel,
  ) {
    const result = await this.PostsService.createPost(bodyPostModel);
    if (result.error !== null) throw new NotFoundException()
    return result.data
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param() id: string,
    @Body() bodyPostModel: bodyPostModel,
  ) {
    const result = await this.PostsService.updatePost(bodyPostModel, id);
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(
    @Param() id: string,
  ) {
    const result = await this.PostsService.deletePost(id);
    if (result.error !== null) throw new NotFoundException()
    return
  }

  @Get(':postId/comments')
  async findComments(
    @Param("postId") postId: string,
    @Query() queryCommentModel: queryCommentModel
  ) {
    const comments = await this.CommentsQueryRepository.findComments(postId, queryCommentModel)
    if (!comments.items.length) throw new NotFoundException()
    return comments
  }


}
