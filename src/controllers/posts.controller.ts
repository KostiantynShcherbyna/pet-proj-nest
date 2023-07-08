import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Param,
  NotFoundException,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { PostsQueryRepository } from 'src/repositories/query/posts.query.repository';
import { PostsService } from 'src/services/posts.service';
import { BodyPostModel } from 'src/models/body/BodyPostModel';
import { QueryPostModel } from 'src/models/query/QueryPostModel';
import { QueryCommentModel } from 'src/models/query/QueryCommentModel';
import { CommentsQueryRepository } from 'src/repositories/query/comments.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository)
    protected PostsQueryRepository: PostsQueryRepository,
    @Inject(PostsService) protected PostsService: PostsService,
    @Inject(CommentsQueryRepository)
    protected CommentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findPosts(@Query() queryPost: QueryPostModel) {
    return await this.PostsQueryRepository.findPosts(queryPost);
  }

  @Get(':id')
  async findPost(@Param() id: string) {
    const post = await this.PostsQueryRepository.findPost(id);
    if (post === null) throw new NotFoundException();
    return post;
  }

  @Post()
  async createPost(@Body() bodyPost: BodyPostModel) {
    const result = await this.PostsService.createPost(bodyPost);
    if (result.error !== null) throw new NotFoundException();
    return result.data;
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(@Param() id: string, @Body() bodyPost: BodyPostModel) {
    const result = await this.PostsService.updatePost(bodyPost, id);
    if (result.error !== null) throw new NotFoundException();
    return;
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param() id: string) {
    const result = await this.PostsService.deletePost(id);
    if (result.error !== null) throw new NotFoundException();
    return;
  }

  @Get(':postId/comments')
  async findComments(
    @Param('postId') postId: string,
    @Query() queryComment: QueryCommentModel,
  ) {
    const comments = await this.CommentsQueryRepository.findComments(
      postId,
      queryComment,
    );
    if (!comments.items.length) throw new NotFoundException();
    return comments;
  }
}
