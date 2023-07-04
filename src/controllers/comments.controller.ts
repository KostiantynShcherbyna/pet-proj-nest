import { Controller, Get, Param, Inject, NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from 'src/repositories/query/postsQuery.repository';
import { PostsService } from 'src/services/posts.service';
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
    const comment = await this.CommentsQueryRepository.findComment(id)
    if (comment === null) throw new NotFoundException()
    return
  }

}
