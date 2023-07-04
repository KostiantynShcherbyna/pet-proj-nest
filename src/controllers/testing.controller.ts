import { Controller, Delete, HttpCode, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsModel } from 'src/schemas/posts.schema';
import { Blogs, BlogsModel } from 'src/schemas/blogs.schema';
import { Comments, CommentsModel } from 'src/schemas/comments.schema';
import { Users, UsersModel } from 'src/schemas/users.schema';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blogs.name) protected BlogsModel: BlogsModel,
    @InjectModel(Posts.name) protected PostsModel: PostsModel,
    @InjectModel(Comments.name) protected CommentsModel: CommentsModel,
    @InjectModel(Users.name) protected UsersModel: UsersModel,
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
          await this.UsersModel.deleteMany({}),
        ]
      )
      return
    } catch (err) {
      throw new ServiceUnavailableException()
    }
  }

}
