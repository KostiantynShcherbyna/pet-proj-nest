import request from "supertest"
import { MongoMemoryServer } from "mongodb-memory-server"
import * as mongoose from "mongoose"
import { Test } from "@nestjs/testing"
import { AppModule } from "../src/app.module"
import { HttpStatus, INestApplication } from "@nestjs/common"
import { EmailAdapter } from "../src/infrastructure/adapters/email.adapter"
import { Users, UsersModel } from "../src/features/super-admin/application/entity/users.schema"


describe(`blogs and posts`, () => {
  let app: INestApplication

  let mongoServer: MongoMemoryServer
  beforeAll(async () => {

    // mongoServer = await MongoMemoryServer.create()
    // const mongoUri = mongoServer.getUri()

    // jest.mock("../settings/configuration", () => ({
    //   default: async () => ({
    //     PORT: Number(process.env.PORT) || 5000,
    //     MONGOOSE_URI: mongoUri,
    //
    //     ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || "ACCESSJWTSECRET",
    //     REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || "REFRESHJWTSECRET",
    //     PASSWORD_RECOVERY_CODE_SECRET: process.env.PASSWORD_RECOVERY_CODE_SECRET || "PASSWORDRECOVERYCODESECRET",
    //   })
    // }))

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .compile()

    const userModel = moduleRef.get<UsersModel>(Users)
    console.log("mongoUri - " + userModel)

    app = moduleRef.createNestApplication()
    await app.init()

    const emailAdapterMock: jest.Mocked<EmailAdapter> = {
      sendConfirmationCode: jest.fn(),
      sendPasswordRecovery: jest.fn(),
    }

    await request(app).delete(`/testing/all-data`)
  })

  afterAll(async () => {
    await request(app).delete(`/testing/all-data`)
    await mongoose.disconnect()
    // await mongoServer.stop()
    await app.close()
  })


  it(`+ Registration User`, async () => {

    const regData = {
      "login": "kstntn",
      "password": "password",
      "email": "kstntn.xxx@gmail.com"
    }

    await request(app)
      .post(`/registration`)
      .send(regData)
      .expect(HttpStatus.CREATED)
  })


  it(`+ Confirmation User`, async () => {

    const confirmData = {
      "code": "123",
    }

    await request(app)
      .post(`/confirmation`)
      .send(confirmData)
      .expect(HttpStatus.CREATED)
  })

  let accessToken
  it(`+ Login User`, async () => {

    const loginData = {
      loginOrEmail: "kstntn",
      password: "password"
    }
    const testData = {
      accessToken: expect.any(String),
    }

    const accessTokenResult = await request(app)
      .post(`/login`)
      .send(loginData)
      .expect(HttpStatus.CREATED)

    accessToken = accessTokenResult.body

    expect(accessToken).toEqual(testData)
  })


  // BLOGS ↓↓↓
  it(`+ GET, should return 200 and empty arr`, async () => {

    await request(app)
      .get(`/blogs`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      })
  })

  it(`- GET, shouldn't return any blog`, async () => {

    const id = 0

    const req = await request(app)
      .get(`/blogs/${id}`)
      .expect(HttpStatus.BAD_REQUEST)

    expect(req.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: "id",
        }
      ]
    })
  })

  it(`- POST, shouldn't create blog w/o authorization`, async () => {

    const data = {
      description: "My description",
      websiteUrl: "My websiteUrl",
    }

    await request(app)
      .post(`blogger/blogs`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it(`- POST, shouldn't create blog w/ incorrect data`, async () => {

    const data = {
      description: "My description",
      websiteUrl: "My websiteUrl",
    }

    await request(app)
      .post(`blogger/blogs`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: expect.any(String),
            field: "name"
          },
          {
            message: expect.any(String),
            field: "websiteUrl"
          }
        ]
      })

    await request(app)
      .get(`/blogs`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      })

  })


  let createdNewBlog
  it(`+ POST, should create blog w/ correct data and autorized`,
    async () => {

      const data = {
        name: "Tim",
        description: "description",
        websiteUrl: "https://someurl.com"
      }

      const testData = {
        ...data,
        id: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      }

      const newBlog = await request(app)
        .post(`blogger/blogs`)
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .send(data)
        .expect(HttpStatus.CREATED)


      createdNewBlog = newBlog.body

      const viewTestModel = {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [testData]
      }

      expect(createdNewBlog).toEqual(testData)

      const existedBlogs = await request(app)
        .get(`/blogs`)
        .expect(HttpStatus.OK)

      expect(existedBlogs.body).toEqual(viewTestModel)
    })


  let createdNewBlog_2
  it(`+ POST, should create blog w/ correct data and autorized`, async () => {

    const data = {
      name: "Jimm",
      description: "My description",
      websiteUrl: "https://webapp.com",
    }

    const testData = {
      ...data,
      id: expect.any(String),
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    }

    const newBlog = await request(app)
      .post(`/blogs`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)

    createdNewBlog_2 = newBlog.body

    expect(createdNewBlog_2).toEqual(testData)

    const existedBlogs = await request(app)
      .get(`/blogs/${createdNewBlog_2.id}`)
      .expect(HttpStatus.OK)

    expect(existedBlogs.body).toEqual(createdNewBlog_2)
  })

  let createdNewBlog_3
  it(`+ POST, should create blog w/ correct data and autorized`, async () => {

    const data = {
      name: "tim",
      description: "description",
      websiteUrl: "https://someurl.com"
    }

    const testData = {
      ...data,
      id: expect.any(String),
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    }

    const newBlog = await request(app)
      .post(`/blogs`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)


    createdNewBlog_3 = newBlog.body


    expect(createdNewBlog_3).toEqual(testData)
  })


  let createdNewBlog_4
  it(`+ POST, should create blog w/ correct data and autorized`, async () => {

    const data = {
      name: "Bim",
      description: "description",
      websiteUrl: "https://someurl.com"
    }

    const testData = {
      ...data,
      id: expect.any(String),
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    }

    const newBlog = await request(app)
      .post(`/blogs`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)


    createdNewBlog_4 = newBlog.body


    expect(createdNewBlog_4).toEqual(testData)
  })


  let createdNewBlog_5
  it(`+ POST, should create blog w/ correct data and autorized`, async () => {

    const data = {
      name: "Dimm",
      description: "description",
      websiteUrl: "https://someurl.com"
    }

    const testData = {
      ...data,
      id: expect.any(String),
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    }

    const newBlog = await request(app)
      .post(`/blogs`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)


    createdNewBlog_5 = newBlog.body

    expect(createdNewBlog_5).toEqual(testData)


    let viewTestModel = {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 5,
      items: [
        createdNewBlog_5,
        createdNewBlog_4,
        createdNewBlog_3,
        createdNewBlog_2,
        createdNewBlog,
      ]
    }

    let existedBlogs

    existedBlogs = await request(app)
      .get(`/blogs`)
      .expect(HttpStatus.OK)

    expect(existedBlogs.body).toEqual(viewTestModel)


    existedBlogs = await request(app)
      .get(`/blogs?searchNameTerm=t`)
      .expect(HttpStatus.OK)

    expect(existedBlogs.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        createdNewBlog_3,
        createdNewBlog,
      ]
    })

    existedBlogs = await request(app)
      .get(`/blogs?searchNameTerm=j`)
      .expect(HttpStatus.OK)

    expect(existedBlogs.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        createdNewBlog_2,
      ]
    })

    existedBlogs = await request(app)
      .get(`/blogs?pageNumber=2`)
      .expect(HttpStatus.OK)

    expect(existedBlogs.body).toEqual({
      pagesCount: 1,
      page: 2,
      pageSize: 10,
      totalCount: 5,
      items: []
    })

  })


  it(`- PUT, should't update blog w/o authorization`, async () => {

    const data = {
      name: "Jem",
      description: "My description",
      websiteUrl: "https://webapp.com",
    }

    await request(app)
      .put(`/blogs/0`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)

  })

  it(`- PUT, should't update unexisting blog `, async () => {

    const data = {
      name: "Jem",
      description: "My description",
      websiteUrl: "https://webapp.com",
    }

    const id = 0

    const req = await request(app)
      .put(`/blogs/${id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST)

    expect(req.body).toEqual({
      errorsMessages: [
        {
          message: `your value of 'id': ${id} is invalid`,
          field: "id"
        }
      ]
    })
  })

  it(`- PUT, should't update blog w/ incorrect data`, async () => {

    const data = {
      description: "My description",
    }

    console.log(createdNewBlog)

    await request(app)
      .put(`/blogs/${createdNewBlog.id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "field 'name' is must be a 'string' type",
            field: "name"
          },
          {
            message: "field 'websiteUrl' is must be a 'string' type",
            field: "websiteUrl"
          }
        ]
      })

  })

  let updatedBlog
  it(`+ PUT, should update blog`, async () => {

    const data = {
      name: "Ram",
      description: "Ram description",
      websiteUrl: "https://someurlRam.com"
    }

    await request(app)
      .put(`/blogs/${createdNewBlog.id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.NO_CONTENT)

    const resp = await request(app)
      .get(`/blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.OK)

    updatedBlog = resp.body

    expect(updatedBlog).toEqual({
      ...createdNewBlog,
      name: data.name,
      description: data.description,
      websiteUrl: data.websiteUrl
    })
  })

  it(`- DELETE, should't delete blog w/o auterization`, async () => {

    await request(app)
      .delete(`/blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.UNAUTHORIZED)

    const expectedBlog = await request(app)
      .get(`/blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.OK)

    expect(expectedBlog.body).toEqual(updatedBlog)

  })

  it(`- DELETE, should't delete blog that does't exist`, async () => {

    await request(app)
      .delete(`/blogs/000`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `your value of 'id': 000 is invalid`,
            field: "id"
          },
        ]
      })

    await request(app)
      .get(`/blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.OK, updatedBlog)
  })


  it(`- POST, should't create POST of blog w/o autorization`, async () => {

    const data = {
      title: "Gim",
      shortDescription: "Gim's shortDescription",
      content: "Gim's content"
    }

    await request(app)
      .post(`/blogs/${createdNewBlog.id}/posts`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)


    await request(app)
      .get(`/blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.NOT_FOUND, {
        errorsMessages: [
          {
            message: `blog with 'blogId': ${createdNewBlog.id} does't exist`,
            field: "blogId"
          }
        ]
      })
  })


  it(`- POST, should't create POST of blog w/ incorrect data`, async () => {

    const data = {
      title: "Gim",
      description: "Gim's shortDescription", // ← incorrect key
      content: "Gim's content"
    }

    const newPost = await request(app)
      .post(`/blogs/${createdNewBlog.id}/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST)

    expect(newPost.body).toEqual({
      errorsMessages: [
        {
          message: `field 'shortDescription' is must be a 'string' type`,
          field: "shortDescription"
        },
      ]
    })

    await request(app)
      .get(`/blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.NOT_FOUND, {
        errorsMessages: [
          {
            message: `blog with 'blogId': ${createdNewBlog.id} does't exist`,
            field: "blogId"
          },
        ]
      })
  })


  let postCreatedNewBlog
  it(`+ POST, should create POST of blog w/ correct data and autorization`, async () => {

    const data = {
      title: "Gim",
      shortDescription: "Gim's shortDescription",
      content: "Gim's content"
    }

    const newPost = await request(app)
      .post(`/blogs/${createdNewBlog.id}/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)

    const testData = {
      ...data,
      id: expect.any(String),
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
    }

    postCreatedNewBlog = newPost.body

    expect(postCreatedNewBlog).toEqual(testData)

    await request(app)
      .get(`/blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postCreatedNewBlog]
      })

  })

  let post2CreatedPostBlog
  it(`+ POST, should create POST of blog w/ correct data and autorization`, async () => {

    const data = {
      title: "Gim2",
      shortDescription: "Gim2's shortDescription",
      content: "Gim2's content"
    }

    const newPost = await request(app)
      .post(`/blogs/${createdNewBlog.id}/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)

    const testData = {
      ...data,
      id: expect.any(String),
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
    }

    post2CreatedPostBlog = newPost.body

    expect(post2CreatedPostBlog).toEqual(testData)

    await request(app)
      .get(`/blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          post2CreatedPostBlog,
          postCreatedNewBlog
        ]
      })
  })


  // createdNewBlog_2 left for add post
  it(`+ DELETE, should delete blog`, async () => {


    const viewTestModel = {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        createdNewBlog_5,
        createdNewBlog_4,
        createdNewBlog_3,
        createdNewBlog_2
      ]
    }

    await request(app)
      .delete(`/blogs/${createdNewBlog.id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(HttpStatus.NO_CONTENT)

    await request(app)
      .get(`/blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.NOT_FOUND)

    await request(app)
      .get(`/blogs`)
      .expect(HttpStatus.OK, viewTestModel)

    await request(app)
      .get(`/blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.NOT_FOUND)
  })


  // POSTS ↓↓↓
  it(`+ GET, should return 200 and empty arr`, async () => {

    await request(app)
      .get(`/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      })
  })

  it(`- GET, should't return any posts`, async () => {

    await request(app)
      .get(`/posts/0`)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `your value of 'id': 0 is invalid`,
            field: "id"
          },
        ]
      })
  })

  it(`- POST, should't creat post w/o autorization`, async () => {

    const data = {
      title: "aaaaaaa",
      shortDescription: "bbbbbbbb",
      content: "cccccccccc",
      blogId: "0",

    }

    await request(app)
      .post(`/posts`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)

    await request(app)
      .get(`/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      })
  })

  it(`- POST, should't creat post, blogs does't exist`, async () => {

    const data = {
      title: "aaaaaaa",
      shortDescription: "bbbbbbbb",
      content: "cccccccccc",
      blogId: "0"
    }

    await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `your value of 'blogId': 0 is invalid`,
            field: "blogId"
          }
        ]
      })

    await request(app)
      .get(`/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      })
  })

  it(`- POST, should't create post w/ incorrect data`, async () => {

    const data = {
      // title: "aaaaaaa",
      shortDescription: "bbbbbbbb",
      content: "cccccccccc",
      blogId: "0",
    }

    await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "field 'title' is must be a 'string' type",
            field: "title"
          },
          {
            message: "your value of 'blogId': 0 is invalid",
            field: "blogId"
          }
        ]
      })

  })

  it(`- POST, should't create post w/ incorrect data one more time`, async () => {

    const data = {
      // title: "aaaaaaa",
      shortDescription: "bbbbbbbb",
      content: "cccccccccc",
      blogId: `${createdNewBlog_2.id}`,
      blogName: `${createdNewBlog_2.name}`
    }

    await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "field 'title' is must be a 'string' type",
            field: "title"
          },
        ]
      })

  })

  let createdNewPost
  it(`+ POST, should create post`, async () => {

    const data = {
      title: "Rim",
      shortDescription: "Rim's shortDescription",
      content: "Rim's content",
      blogId: `${createdNewBlog_2.id}`,
      blogName: expect.any(String),
      createdAt: expect.any(String),
    }

    const expectedPost = {
      ...data,
      id: expect.any(String)
    }

    const newPost = await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)

    createdNewPost = newPost.body

    expect(createdNewPost).toEqual(expectedPost)
  })

  let createdNewPost2
  it(`+ POST, should create post`, async () => {

    const data = {
      title: "Aim",
      shortDescription: "Aim's shortDescription",
      content: "Aim's content",
      blogId: `${createdNewBlog_2.id}`,
      blogName: expect.any(String),
      createdAt: expect.any(String),
    }

    const expectedPost = {
      ...data,
      id: expect.any(String)
    }

    const newPost = await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.CREATED)

    createdNewPost2 = newPost.body

    expect(createdNewPost2).toEqual(expectedPost)
  })


  it(`+ GET, should return 200 and arr w/ two posts`, async () => {

    await request(app)
      .get(`/posts/`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          createdNewPost2,
          createdNewPost
        ]
      })
  })

  it(`+ GET, should return 200 and arr w/ filtred post`, async () => {

    await request(app)
      .get(`/posts?sortDirection=asc`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          createdNewPost,
          createdNewPost2
        ]
      })
  })


  it(`- PUT, should't update post w/o autorization`, async () => {

    const data = {
      title: "Rim",
      shortDescription: "Rim's shortDescription",
      content: "Rim's content",
      blogId: `${createdNewBlog_2.id}`,
      blogName: `${createdNewBlog_2.name}`
    }


    await request(app)
      .put(`/posts/${createdNewPost.id}`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)

    await request(app)
      .get(`/posts/${createdNewPost.id}`)
      .expect(HttpStatus.OK, createdNewPost)
  })

  it(`- PUT, should't update post, post does't exist`, async () => {

    const data = {
      title: "Rim",
      shortDescription: "Rim's shortDescription",
      content: "Rim's content",
      blogId: `${createdNewBlog_2.id}`,
    }

    await request(app)
      .put(`/posts/0000`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `your value of 'id': 0000 is invalid`,
            field: `id`
          }
        ]
      })
  })

  it(`- PUT, should't update post w/ incorrect input data`, async () => {

    const data = {
      title: "Rimmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
      shortDescription: "Rim's shortDescription",
      content: "Rim's content",
      blogId: `${createdNewBlog_2.id}`,
      blogName: `${createdNewBlog_2.name}`
    }

    const MAX_LENGTH_TITLE = 30

    await request(app)
      .put(`/posts/${createdNewPost.id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `max length is ${MAX_LENGTH_TITLE} characters`,
            field: `title`
          }
        ]
      })
  })

  it(`+ PUT, should update post w/ correct input data`, async () => {

    const data = {
      title: "Rim2",
      shortDescription: "Rim2's shortDescription",
      content: "Rim2's content",
      blogId: `${createdNewPost.blogId}`,
      blogName: `${createdNewPost.blogName}`
    }

    const expectedPostToBe = {
      ...createdNewPost,
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content
    }

    await request(app)
      .put(`/posts/${createdNewPost.id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(data)
      .expect(HttpStatus.NO_CONTENT)

    const updatedPostBody = await request(app)
      .get(`/posts/${createdNewPost.id}`)
      .expect(HttpStatus.OK)

    const updatedPost = updatedPostBody.body

    expect(updatedPost).toEqual(expectedPostToBe)
  })

  it(`- DELETE, should't delete post w/o auterization`, async () => {

    await request(app)
      .delete(`/posts/${createdNewPost.id}`)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it(`- DELETE, should't delete post does't exist`, async () => {

    await request(app)
      .delete(`/posts/0000`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `your value of 'id': 0000 is invalid`,
            field: `id`
          }
        ]
      })
  })

  it(`- DELETE, should delete post`, async () => {

    await request(app)
      .delete(`/posts/${createdNewPost.id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(HttpStatus.NO_CONTENT)

    await request(app)
      .get(`/posts/${createdNewPost.id}`)
      .expect(HttpStatus.NOT_FOUND)

    await request(app)
      .get(`/posts/`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdNewPost2]
      })

    await request(app)
      .delete(`/posts/${createdNewPost2.id}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(HttpStatus.NO_CONTENT)


    await request(app)
      .get(`/posts/`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      })
  })


})