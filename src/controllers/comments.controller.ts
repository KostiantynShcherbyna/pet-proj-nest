import { Body, Controller, Delete, Get, Post, Put, Query, Param, NotFoundException, HttpCode, Inject } from '@nestjs/common';
import { PostsQueryRepository } from 'src/repositories/query/postsQuery.repository';
import { PostsService } from 'src/services/posts.service';
import { bodyPostModel } from 'src/models/body/bodyPostModel';
import { queryPostModel } from 'src/models/query/queryPostModel';
import { queryCommentModel } from 'src/models/query/queryCommentModel';
import { CommentsQueryRepository } from 'src/repositories/query/commentsQuery.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(PostsQueryRepository) protected PostsQueryRepository: PostsQueryRepository,
    @Inject(PostsService) protected PostsService: PostsService,
    @Inject(CommentsQueryRepository) protected CommentsQueryRepository: CommentsQueryRepository,
  ) { }

  @Get(':id')
  async findComment(
    @Param('id') id: string,
  ) {
    return await this.CommentsQueryRepository.findComment(id)
  }

}
