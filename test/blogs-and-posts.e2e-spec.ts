import request from "supertest"
import { Test } from "@nestjs/testing"
import { AppModule } from "../src/app.module"
import { HttpStatus, INestApplication } from "@nestjs/common"
import { EmailAdapter } from "../src/infrastructure/adapters/email.adapter"
import { appSettings } from "../src/app.settings"
import { EmailAdapterMock } from "../src/infrastructure/testing/infrastructure/email-adapter.mock"
import { Users } from "../src/features/super-admin/application/entity/users.schema"
import { LikeStatus } from "../src/infrastructure/utils/constants"
import { RegistrationBodyInputModel } from "../src/features/auth/api/models/input/registration.body.input-model"
import { BlogsRepository } from "../src/features/blogs/infrastructure/blogs.repository"


describe(`blogs and posts`, () => {
  jest.setTimeout(30 * 1000)
  let app: INestApplication
  let httpServer: any
  let blogRepo: BlogsRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useClass(EmailAdapterMock)
      .compile()


    app = moduleRef.createNestApplication()
    app = appSettings(app)
    blogRepo = app.get(BlogsRepository)
    await app.init()

    httpServer = app.getHttpServer()

    await request(httpServer)
      .delete(`/testing/all-data`)
  })

  afterAll(async () => {
    await request(httpServer).delete(`/testing/all-data`)
    await app.close()
  })

  let user1: Users
  it(`+ Registration user`, async () => {

    const regDto: RegistrationBodyInputModel = {
      "login": "kstntn",
      "password": "password",
      "email": "kstntn.xxx@gmail.com"
    }

    const createUserRes = await request(httpServer)
      .post(`/auth/registration`)
      .send(regDto)

    expect(createUserRes.status).toBe(HttpStatus.NO_CONTENT)
    expect.setState({user: { ...regDto, code: '123' }})

    const user1Result = await request(httpServer)
      .get(`/testing/user`)
      .send({
        loginOrEmail: "kstntn.xxx@gmail.com"
      })
      .expect(HttpStatus.OK)

    const usersResult = await request(httpServer)
      .get(`/sa/users`)
      .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
      .expect(HttpStatus.OK)

    user1 = user1Result.body

  })


  it(`+ Confirmation user`, async () => {
  const { user } = expect.getState()
    const confirmData = {
      "code": user1.emailConfirmation.confirmationCode
    }

    await request(httpServer)
      .post(`/auth/confirmation`)
      .send(confirmData)
      .expect(HttpStatus.CREATED)
  })


  let accessTokenDto: { accessToken: string }
  it(`+ Login user`, async () => {

    const loginDto = {
      loginOrEmail: "kstntn",
      password: "password"
    }
    const testDto = {
      accessToken: expect.any(String),
    }

    const accessTokenResult = await request(httpServer)
      .post(`/auth/login`)
      .send(loginDto)
      .expect(HttpStatus.OK)

    expect(accessTokenResult.body).toEqual(testDto)

    accessTokenDto = accessTokenResult.body
  })


  // BLOGS ↓↓↓
  it(`+ GET, should return 200 and empty arr`, async () => {

    await request(httpServer)
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

    const req = await request(httpServer)
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

    await request(httpServer)
      .post(`blogger/blogs`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it(`- POST, shouldn't create blog w/ incorrect data`, async () => {

    const data = {
      description: "My description",
      websiteUrl: "My websiteUrl",
    }

    await request(httpServer)
      .post(`blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
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

    await request(httpServer)
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
  it(`+ POST, should create blog w/ correct data and authorized`,
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

      const newBlog = await request(httpServer)
        .post(`blogger/blogs`)
        .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
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

      const existedBlogs = await request(httpServer)
        .get(`/blogs`)
        .expect(HttpStatus.OK)

      expect(existedBlogs.body).toEqual(viewTestModel)
    })


  let createdNewBlog_2
  it(`+ POST, should create blog w/ correct data and authorized`, async () => {

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

    const newBlog = await request(httpServer)
      .post(`blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.CREATED)

    createdNewBlog_2 = newBlog.body

    expect(createdNewBlog_2).toEqual(testData)

    const existedBlogs = await request(httpServer)
      .get(`/blogs/${createdNewBlog_2.id}`)
      .expect(HttpStatus.OK)

    expect(existedBlogs.body).toEqual(createdNewBlog_2)
  })


  let createdNewBlog_3
  it(`+ POST, should create blog w/ correct data and authorized`, async () => {

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

    const newBlog = await request(httpServer)
      .post(`/blogs`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.CREATED)

    createdNewBlog_3 = newBlog.body

    expect(createdNewBlog_3).toEqual(testData)
  })


  let createdNewBlog_4
  it(`+ POST, should create blog w/ correct data and authorized`, async () => {

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

    const newBlog = await request(httpServer)
      .post(`/blogs`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.CREATED)

    createdNewBlog_4 = newBlog.body

    expect(createdNewBlog_4).toEqual(testData)
  })


  let createdNewBlog_5
  it(`+ POST, should create blog w/ correct data and authorized`, async () => {

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

    const newBlog = await request(httpServer)
      .post(`/blogs`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
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

    existedBlogs = await request(httpServer)
      .get(`/blogs`)
      .expect(HttpStatus.OK)

    expect(existedBlogs.body).toEqual(viewTestModel)


    existedBlogs = await request(httpServer)
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

    existedBlogs = await request(httpServer)
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

    existedBlogs = await request(httpServer)
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

    await request(httpServer)
      .put(`blogger/blogs/0`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)

  })

  it(`- PUT, shouldn't update unexisting blog `, async () => {

    const data = {
      name: "Jem",
      description: "My description",
      websiteUrl: "https://webapp.com",
    }

    const id = 0

    const req = await request(httpServer)
      .put(`blogger/blogs/${id}`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.BAD_REQUEST)

    expect(req.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: "id"
        }
      ]
    })
  })

  it(`- PUT, shouldn't update blog w/ incorrect data`, async () => {

    const data = {
      description: "My description",
    }

    console.log(createdNewBlog)

    await request(httpServer)
      .put(`blogger/blogs/${createdNewBlog.id}`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: expect.any(String),
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

    await request(httpServer)
      .put(`blogger/blogs/${createdNewBlog.id}`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.NO_CONTENT)

    const resp = await request(httpServer)
      .get(`blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.OK)

    updatedBlog = resp.body

    expect(updatedBlog).toEqual({
      ...createdNewBlog,
      name: data.name,
      description: data.description,
      websiteUrl: data.websiteUrl
    })
  })

  it(`- DELETE, shouldn't delete blog w/o authorization`, async () => {

    await request(httpServer)
      .delete(`blogger/blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.UNAUTHORIZED)

    const expectedBlog = await request(httpServer)
      .get(`blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.OK)

    expect(expectedBlog.body).toEqual(updatedBlog)

  })

  it(`- DELETE, shouldn't delete blog that doesn't exist`, async () => {

    await request(httpServer)
      .delete(`blogger/blogs/000`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: expect.any(String),
            field: "id"
          },
        ]
      })

    await request(httpServer)
      .get(`blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.OK, updatedBlog)
  })


  it(`- POST, shouldn't create POST of blog w/o authorization`, async () => {

    const data = {
      title: "Gim",
      shortDescription: "Gim's shortDescription",
      content: "Gim's content"
    }

    await request(httpServer)
      .post(`blogger/blogs/${createdNewBlog.id}/posts`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED)


    const postsResult = await request(httpServer)
      .get(`blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.OK)

    expect(postsResult.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: []
    })
  })


  it(`- POST, shouldn't create POST of blog w/ incorrect data`, async () => {

    const data = {
      title: "Gim",
      description: "Gim's shortDescription", // ← incorrect key
      content: "Gim's content"
    }

    const newPost = await request(httpServer)
      .post(`blogger/blogs/${createdNewBlog.id}/posts`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.BAD_REQUEST)

    expect(newPost.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: "shortDescription"
        },
      ]
    })

    await request(httpServer)
      .get(`blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.NOT_FOUND, {
        errorsMessages: [
          {
            message: expect.any(String),
            field: "blogId"
          },
        ]
      })
  })


  let postCreatedNewBlog
  it(`+ POST, should create POST of blog w/ correct data and authorization`, async () => {

    const data = {
      title: "Gim",
      shortDescription: "Gim's shortDescription",
      content: "Gim's content"
    }

    const newPost = await request(httpServer)
      .post(`blogger/blogs/${createdNewBlog.id}/posts`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.CREATED)

    const testData = {
      ...data,
      id: expect.any(String),
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: []
      }
    }

    postCreatedNewBlog = newPost.body

    expect(postCreatedNewBlog).toEqual(testData)

    await request(httpServer)
      .get(`blogs/${createdNewBlog.id}/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [postCreatedNewBlog]
      })

  })


  let post2CreatedPostBlog
  it(`+ POST, should create POST of blog w/ correct data and authorization`, async () => {

    const data = {
      title: "Gim2",
      shortDescription: "Gim2's shortDescription",
      content: "Gim2's content"
    }

    const newPost = await request(httpServer)
      .post(`blogger/blogs/${createdNewBlog.id}/posts`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .send(data)
      .expect(HttpStatus.CREATED)

    const testData = {
      ...data,
      id: expect.any(String),
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: []
      }
    }

    post2CreatedPostBlog = newPost.body

    expect(post2CreatedPostBlog).toEqual(testData)

    await request(httpServer)
      .get(`blogs/${createdNewBlog.id}/posts`)
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

    await request(httpServer)
      .delete(`blogger/blogs/${createdNewBlog.id}`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .expect(HttpStatus.NO_CONTENT)

    await request(httpServer)
      .get(`blogs/${createdNewBlog.id}`)
      .expect(HttpStatus.NOT_FOUND)

    await request(httpServer)
      .get(`blogs`)
      .expect(HttpStatus.OK, viewTestModel)

    await request(httpServer)
      .get(`blogs/${createdNewBlog.id}/posts`)
      .set("Authorization", `Bearer ${accessTokenDto.accessToken}`)
      .expect(HttpStatus.NOT_FOUND)

  })


  // POSTS ↓↓↓
  it(`+ GET, should return 200 and empty arr`, async () => {

    await request(httpServer)
      .get(`/posts`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      })
  })

  it(`- GET, shouldn't return any posts`, async () => {

    await request(httpServer)
      .get(`/posts/0`)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: expect.any(String),
            field: "id"
          },
        ]
      })
  })

  // it(`- POST, shouldn't creat post w/o authorization`, async () => {
  //
  //   const data = {
  //     title: "aaaaaaa",
  //     shortDescription: "bbbbbbbb",
  //     content: "cccccccccc",
  //     blogId: "0",
  //
  //   }
  //
  //   await request(httpServer)
  //     .post(`/posts`)
  //     .send(data)
  //     .expect(HttpStatus.UNAUTHORIZED)
  //
  //   await request(httpServer)
  //     .get(`/posts`)
  //     .expect(HttpStatus.OK, {
  //       pagesCount: 0,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 0,
  //       items: []
  //     })
  // })

  // it(`- POST, shouldn't creat post, blogs doesn't exist`, async () => {
  //
  //   const data = {
  //     title: "aaaaaaa",
  //     shortDescription: "bbbbbbbb",
  //     content: "cccccccccc",
  //     blogId: "0"
  //   }
  //
  //   await request(httpServer)
  //     .post(`/posts`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [
  //         {
  //           message: `your value of 'blogId': 0 is invalid`,
  //           field: "blogId"
  //         }
  //       ]
  //     })
  //
  //   await request(httpServer)
  //     .get(`/posts`)
  //     .expect(HttpStatus.OK, {
  //       pagesCount: 0,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 0,
  //       items: []
  //     })
  // })
  //
  // it(`- POST, should't create post w/ incorrect data`, async () => {
  //
  //   const data = {
  //     // title: "aaaaaaa",
  //     shortDescription: "bbbbbbbb",
  //     content: "cccccccccc",
  //     blogId: "0",
  //   }
  //
  //   await request(httpServer)
  //     .post(`/posts`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [
  //         {
  //           message: "field 'title' is must be a 'string' type",
  //           field: "title"
  //         },
  //         {
  //           message: "your value of 'blogId': 0 is invalid",
  //           field: "blogId"
  //         }
  //       ]
  //     })
  //
  // })
  //
  // it(`- POST, should't create post w/ incorrect data one more time`, async () => {
  //
  //   const data = {
  //     // title: "aaaaaaa",
  //     shortDescription: "bbbbbbbb",
  //     content: "cccccccccc",
  //     blogId: `${createdNewBlog_2.id}`,
  //     blogName: `${createdNewBlog_2.name}`
  //   }
  //
  //   await request(httpServer)
  //     .post(`/posts`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [
  //         {
  //           message: "field 'title' is must be a 'string' type",
  //           field: "title"
  //         },
  //       ]
  //     })
  //
  // })
  //
  // let createdNewPost
  // it(`+ POST, should create post`, async () => {
  //
  //   const data = {
  //     title: "Rim",
  //     shortDescription: "Rim's shortDescription",
  //     content: "Rim's content",
  //     blogId: `${createdNewBlog_2.id}`,
  //     blogName: expect.any(String),
  //     createdAt: expect.any(String),
  //   }
  //
  //   const expectedPost = {
  //     ...data,
  //     id: expect.any(String)
  //   }
  //
  //   const newPost = await request(httpServer)
  //     .post(`/posts`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.CREATED)
  //
  //   createdNewPost = newPost.body
  //
  //   expect(createdNewPost).toEqual(expectedPost)
  // })
  //
  // let createdNewPost2
  // it(`+ POST, should create post`, async () => {
  //
  //   const data = {
  //     title: "Aim",
  //     shortDescription: "Aim's shortDescription",
  //     content: "Aim's content",
  //     blogId: `${createdNewBlog_2.id}`,
  //     blogName: expect.any(String),
  //     createdAt: expect.any(String),
  //   }
  //
  //   const expectedPost = {
  //     ...data,
  //     id: expect.any(String)
  //   }
  //
  //   const newPost = await request(httpServer)
  //     .post(`/posts`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.CREATED)
  //
  //   createdNewPost2 = newPost.body
  //
  //   expect(createdNewPost2).toEqual(expectedPost)
  // })
  //
  //
  // it(`+ GET, should return 200 and arr w/ two posts`, async () => {
  //
  //   await request(httpServer)
  //     .get(`/posts/`)
  //     .expect(HttpStatus.OK, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 2,
  //       items: [
  //         createdNewPost2,
  //         createdNewPost
  //       ]
  //     })
  // })
  //
  // it(`+ GET, should return 200 and arr w/ filtred post`, async () => {
  //
  //   await request(httpServer)
  //     .get(`/posts?sortDirection=asc`)
  //     .expect(HttpStatus.OK, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 2,
  //       items: [
  //         createdNewPost,
  //         createdNewPost2
  //       ]
  //     })
  // })
  //
  //
  // it(`- PUT, should't update post w/o autorization`, async () => {
  //
  //   const data = {
  //     title: "Rim",
  //     shortDescription: "Rim's shortDescription",
  //     content: "Rim's content",
  //     blogId: `${createdNewBlog_2.id}`,
  //     blogName: `${createdNewBlog_2.name}`
  //   }
  //
  //
  //   await request(httpServer)
  //     .put(`/posts/${createdNewPost.id}`)
  //     .send(data)
  //     .expect(HttpStatus.UNAUTHORIZED)
  //
  //   await request(httpServer)
  //     .get(`/posts/${createdNewPost.id}`)
  //     .expect(HttpStatus.OK, createdNewPost)
  // })
  //
  // it(`- PUT, should't update post, post does't exist`, async () => {
  //
  //   const data = {
  //     title: "Rim",
  //     shortDescription: "Rim's shortDescription",
  //     content: "Rim's content",
  //     blogId: `${createdNewBlog_2.id}`,
  //   }
  //
  //   await request(httpServer)
  //     .put(`/posts/0000`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [
  //         {
  //           message: `your value of 'id': 0000 is invalid`,
  //           field: `id`
  //         }
  //       ]
  //     })
  // })
  //
  // it(`- PUT, should't update post w/ incorrect input data`, async () => {
  //
  //   const data = {
  //     title: "Rimmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
  //     shortDescription: "Rim's shortDescription",
  //     content: "Rim's content",
  //     blogId: `${createdNewBlog_2.id}`,
  //     blogName: `${createdNewBlog_2.name}`
  //   }
  //
  //   const MAX_LENGTH_TITLE = 30
  //
  //   await request(httpServer)
  //     .put(`/posts/${createdNewPost.id}`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [
  //         {
  //           message: `max length is ${MAX_LENGTH_TITLE} characters`,
  //           field: `title`
  //         }
  //       ]
  //     })
  // })
  //
  // it(`+ PUT, should update post w/ correct input data`, async () => {
  //
  //   const data = {
  //     title: "Rim2",
  //     shortDescription: "Rim2's shortDescription",
  //     content: "Rim2's content",
  //     blogId: `${createdNewPost.blogId}`,
  //     blogName: `${createdNewPost.blogName}`
  //   }
  //
  //   const expectedPostToBe = {
  //     ...createdNewPost,
  //     title: data.title,
  //     shortDescription: data.shortDescription,
  //     content: data.content
  //   }
  //
  //   await request(httpServer)
  //     .put(`/posts/${createdNewPost.id}`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .send(data)
  //     .expect(HttpStatus.NO_CONTENT)
  //
  //   const updatedPostBody = await request(httpServer)
  //     .get(`/posts/${createdNewPost.id}`)
  //     .expect(HttpStatus.OK)
  //
  //   const updatedPost = updatedPostBody.body
  //
  //   expect(updatedPost).toEqual(expectedPostToBe)
  // })
  //
  // it(`- DELETE, should't delete post w/o auterization`, async () => {
  //
  //   await request(httpServer)
  //     .delete(`/posts/${createdNewPost.id}`)
  //     .expect(HttpStatus.UNAUTHORIZED)
  // })
  //
  // it(`- DELETE, should't delete post does't exist`, async () => {
  //
  //   await request(httpServer)
  //     .delete(`/posts/0000`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .expect(HttpStatus.BAD_REQUEST, {
  //       errorsMessages: [
  //         {
  //           message: `your value of 'id': 0000 is invalid`,
  //           field: `id`
  //         }
  //       ]
  //     })
  // })
  //
  // it(`- DELETE, should delete post`, async () => {
  //
  //   await request(httpServer)
  //     .delete(`/posts/${createdNewPost.id}`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .expect(HttpStatus.NO_CONTENT)
  //
  //   await request(httpServer)
  //     .get(`/posts/${createdNewPost.id}`)
  //     .expect(HttpStatus.NOT_FOUND)
  //
  //   await request(httpServer)
  //     .get(`/posts/`)
  //     .expect(HttpStatus.OK, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [createdNewPost2]
  //     })
  //
  //   await request(httpServer)
  //     .delete(`/posts/${createdNewPost2.id}`)
  //     .set("Authorization", "Basic YWRtaW46cXdlcnR5")
  //     .expect(HttpStatus.NO_CONTENT)
  //
  //
  //   await request(httpServer)
  //     .get(`/posts/`)
  //     .expect(HttpStatus.OK, {
  //       pagesCount: 0,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 0,
  //       items: []
  //     })
  // })


})