import dotenv from 'dotenv'
import { Module } from '@nestjs/common';
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
import { UsersController } from './controllers/users.controller';
import { Users, UsersSchema } from './schemas/users.schema';
import { UsersQueryRepository } from './repositories/query/usersQuery.repository';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { CommentsController } from './controllers/comments.controller';
import { TestingController } from './controllers/testing.controller';
import { settings } from './settings';
import { Devices, DevicesSchema } from './schemas/devices.schema';
import { AuthController } from './controllers/auth.controller';
import { DevicesService } from './services/devices.service';
import { DevicesRepository } from './repositories/devices.repository';

// const mongooseURI = process.env.MONGOOSE_URL || 'mongodb://0.0.0.0:27017'

@Module({
  imports: [
    MongooseModule.forRoot("mongodb+srv://kostyalys:bagrat10n@cluster0.7mo0iox.mongodb.net/BE-2-0-DEV?retryWrites=true&w=majority"),
    MongooseModule.forFeature(
      [
        { name: Blogs.name, schema: BlogsSchema },
        { name: Posts.name, schema: PostsSchema },
        { name: Comments.name, schema: CommentsSchema },
        { name: Users.name, schema: UsersSchema },
        { name: Devices.name, schema: DevicesSchema },
      ]
    ),
  ],
  controllers: [
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    TestingController,
    AuthController,
  ],
  providers: [
    BlogsService,
    PostsService,
    UsersService,
    DevicesService,

    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    UsersRepository,
    UsersQueryRepository,
    CommentsQueryRepository,
    DevicesRepository,

  ]
})
export class AppModule { }
