import dotenv from 'dotenv'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blogs, BlogsSchema } from './schemas/blogs.schema';
import { BlogsService } from './services/blogs.service';
import { BlogsController } from './controllers/blogs.controller';
import { BlogsRepository } from './repositories/blogs.repository';
import { BlogsQueryRepository } from './repositories/query/blogsQuery.repository';
import { PostsService } from './services/posts.service';
import { PostsRepository } from './repositories/posts.repository';
import { PostsQueryRepository } from './repositories/query/postsQuery.repository';
import { Posts, PostsSchema } from './schemas/posts.schema';
import { CommentsQueryRepository } from './repositories/query/commentsQuery.repository';
import { Comments, CommentsSchema } from './schemas/comments.schema';
import { PostsController } from './controllers/posts.controller';
// import { Posts, PostsSchema } from './schemas/posts.schema';

// const mongooseURI = process.env.MONGOOSE_URL || 'mongodb://0.0.0.0:27017'

@Module({
  imports: [
    MongooseModule.forRoot("mongodb+srv://kostyalys:bagrat10n@cluster0.7mo0iox.mongodb.net/BE-2-0-DEV?retryWrites=true&w=majority"),
    MongooseModule.forFeature(
      [
        { name: Blogs.name, schema: BlogsSchema },
        { name: Posts.name, schema: PostsSchema },
        { name: Comments.name, schema: CommentsSchema },
      ]
    ),
  ],
  controllers: [
    BlogsController,
    PostsController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    CommentsQueryRepository,]
})
export class AppModule { }
