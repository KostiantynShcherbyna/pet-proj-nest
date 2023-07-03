import dotenv from 'dotenv'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blogs, BlogsSchema } from './schemas/blogs.schema';
import { BlogsService } from './services/blogs.service';
import { BlogsController } from './blogs.controller';
import { BlogsRepository } from './repositories/blogs.repository';
import { BlogsQueryRepository } from './repositories/query/blogsQuery.repository';
// import { Posts, PostsSchema } from './schemas/posts.schema';

// const mongooseURI = process.env.MONGOOSE_URL || 'mongodb://0.0.0.0:27017'

@Module({
  imports: [
    MongooseModule.forRoot("mongodb+srv://kostyalys:bagrat10n@cluster0.7mo0iox.mongodb.net/BE-2-0-DEV?retryWrites=true&w=majority"),
    MongooseModule.forFeature(
      [
        { name: Blogs.name, schema: BlogsSchema },
        // { name: Posts.name, schema: PostsSchema }
      ]
    ),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class AppModule { }
