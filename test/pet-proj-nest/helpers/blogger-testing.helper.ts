import { CreateBlogBodyInputModel } from "../../../src/features/blogger/api/models/input/create-blog.body.input-model"
import request from "supertest"
import { endpoints } from "./routing.helper"
import { faker } from "@faker-js/faker"
import { CreatePostBodyInputModel } from "../../../src/features/blogger/api/models/input/create-post.body.input-model"
import {
  CreateBloggerBlogOutputModel
} from "../../../src/features/blogger/api/models/output/create-blogger-blog.output-model"
import { superUser } from "../../ht16/helpers/prepeared-data"
import { CreatePostParamInputModel } from "../../../src/features/blogger/api/models/input/create-post.param.input-model"
import {
  CreateBloggerPostOutputModel
} from "../../../src/features/blogger/api/models/output/create-blogger-post.output-model"

export class BloggerTestingHelper {
  constructor(private readonly server: any) {
  }

  private createInputBlogData() {
    return {
      name: faker.word.noun({ length: { min: 1, max: 15 } }),
      description: faker.word.words(),
      websiteUrl: faker.internet.url(),
    }
  }

  private createInputPostData() {
    return {
      title: faker.word.noun({ length: { min: 1, max: 30 } }),
      shortDescription: faker.word.words(),
      content: faker.word.words({ count: { min: 1, max: 10 } }),
    }
  }

  // BLOGS ↓↓↓
  async getBlogs(accessToken: string) {
    const response = await request(this.server)
      .get(endpoints.bloggerController.getBlogs())
      .auth(accessToken, { type: "bearer" })

    return { status: response.status, body: response.body }
  }

  async createBlog(accessToken: string) {
    const inputBlogData = this.createInputBlogData()
    const response = await request(this.server)
      .post(endpoints.bloggerController.postBlog())
      .auth(accessToken, { type: "bearer" })
      .send(inputBlogData)

    return { status: response.status, body: response.body, inputBlogData }
  }

  async createPost(accessToken: string, blogId: string) {
    const inputPostData = this.createInputPostData()
    const response = await request(this.server)
      .post(endpoints.bloggerController.postPost(blogId))
      .auth(accessToken, { type: "bearer" })
      .send(inputPostData)

    return { status: response.status, body: response.body, inputPostData }
  }

  async createBlogs(accessToken: string, countOfBlogs: number) {
    const blogsView: {
      status: number,
      body: CreateBloggerBlogOutputModel,
      inputBlogData: CreateBlogBodyInputModel
    }[] = []

    for (let i = 0; i < countOfBlogs; i++) {
      const inputBlogData = {
        name: `name${i}`,
        description: `description${i}`,
        websiteUrl: `https://www.websiteUrl${i}.com`,
      }
      const response = await request(this.server)
        .post(endpoints.bloggerController.postBlog())
        .auth(accessToken, { type: "bearer" })
        .send(inputBlogData)

      blogsView.push({ status: response.status, body: response.body, inputBlogData })
    }

    return blogsView
  }

  async createPostsOfBlog(accessToken: string, blogsId: string[], countOfPosts: number,) {
    const posts: {
      status: number,
      body: CreateBloggerPostOutputModel,
      inputPostData: CreatePostBodyInputModel
    }[] = []
    for (let i = 0; i < countOfPosts; i++) {
      const inputPostData = {
        title: `title${i}`,
        shortDescription: `shortDescription${i}`,
        content: `content${i}`,
      }
      const response = await request(this.server)
        .post(endpoints.bloggerController.postPost(blogsId[i]))
        .auth(accessToken, { type: "bearer" })
        .send(inputPostData)
      posts.push({ status: response.status, body: response.body, inputPostData })
    }
    return posts
  }

  async getPosts(accessToken: string, blogId: string) {
    const response = await request(this.server)
      .get(endpoints.bloggerController.getPosts(blogId))
      .auth(accessToken, { type: "bearer" })

    return { status: response.status, body: response.body }
  }

  async updateBlog(accessToken: string, blogId: string) {
    const inputBlogData = {
      name: `updatedName`,
      description: `updatedDescription`,
      websiteUrl: `https://www.updatedWebsiteUrl.com`,
    }
    const response = await request(this.server)
      .put(endpoints.bloggerController.putBlog(blogId))
      .auth(accessToken, { type: "bearer" })
      .send(inputBlogData)

    return response.status
  }

  async updatePost(accessToken: string, blogId: string, postId: string) {
    const inputPostData = {
      title: `updatedTitle`,
      shortDescription: `updatedShortDescription`,
      content: `updatedContent`,
    }
    const response = await request(this.server)
      .put(endpoints.bloggerController.putPost(blogId, postId))
      .auth(accessToken, { type: "bearer" })
      .send(inputPostData)

    return response.status
  }

  async getBlogsComments(accessToken: string) {
    const response = await request(this.server)
      .get(endpoints.bloggerController.getBlogsComments())
      .auth(accessToken, { type: "bearer" })

    return { status: response.status, body: response.body }
  }

  async deletePost(accessToken: string, blogId: string, postId: string) {
    const response = await request(this.server)
      .delete(endpoints.bloggerController.deletePost(blogId, postId))
      .auth(accessToken, { type: "bearer" })

    return response.status
  }

  async banUser(accessToken: string, userId: string, blogId: string) {
    const inputBanData = {
      isBanned: true,
      banReason: "stringstringstringst",
      blogId: blogId,
    }
    const response = await request(this.server)
      .put(endpoints.bloggerController.banUser(userId))
      .auth(accessToken, { type: "bearer" })
      .send(inputBanData)

    return response.status
  }

  async getBannedUsersOfBlog(accessToken: string, blogId: string) {
    const response = await request(this.server)
      .get(endpoints.bloggerController.getBannedUsersOfBlog(blogId))
      .auth(accessToken, { type: "bearer" })

    return { status: response.status, body: response.body }
  }


}