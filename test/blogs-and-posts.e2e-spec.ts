import request from "supertest"
import { Test } from "@nestjs/testing"
import { AppModule } from "../src/app.module"
import { HttpStatus, INestApplication } from "@nestjs/common"
import { EmailAdapter } from "../src/infrastructure/adapters/email.adapter"
import { appSettings } from "../src/app.settings"
import { EmailAdapterMock } from "../src/infrastructure/testing/infrastructure/email-adapter.mock"
import { RegistrationBodyInputModel } from "../src/features/auth/api/models/input/registration.body.input-model"
import { BlogsRepository } from "../src/features/blogs/infrastructure/blogs.repository"
import { LikeStatus } from "../src/infrastructure/utils/constants"
import { randomUUID } from "crypto"
import { Types } from "mongoose"


describe(`e2e-pet-proj-nest`, () => {
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

    await request(httpServer).delete(`/testing/all-data`)
  })

  afterAll(async () => {
    await request(httpServer).delete(`/testing/all-data`)
    await app.close()
  })

// REGISTRATION and REGISTRATION-CONFIRMATION and LOGIN ↓↓↓
  describe(`REGISTRATION and REGISTRATION-CONFIRMATION and LOGIN`,
    () => {

      it(`+ Registration user`, async () => {

        const regDto: RegistrationBodyInputModel = {
          "login": "kstntn",
          "password": "password",
          "email": "kstntn.xxx@gmail.com"
        }

        const regUser1Res = await request(httpServer)
          .post(`/auth/registration`)
          .send(regDto)

        expect(regUser1Res.status).toEqual(HttpStatus.NO_CONTENT)


        const user1Result = await request(httpServer)
          .get(`/testing/user`)
          .send({
            loginOrEmail: "kstntn.xxx@gmail.com"
          })

        expect(user1Result.status).toEqual(HttpStatus.OK)

        expect.setState({ user1: user1Result.body })

      })


      it(`+ Confirmation user`, async () => {
        const { user1 } = expect.getState()

        const confirmData = {
          "code": user1.emailConfirmation.confirmationCode
        }

        await request(httpServer)
          .post(`/auth/registration-confirmation`)
          .send(confirmData)
          .expect(HttpStatus.NO_CONTENT)
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

        expect(accessTokenResult.status).toEqual(HttpStatus.OK)
        expect(accessTokenResult.body).toEqual(testDto)


        expect.setState({ accessTokenUser1: accessTokenResult.body.accessToken })

        const userTest = {
          id: randomUUID(),
          name: "userTest"
        }
        console.log(userTest, 1)
        expect.setState({ userTest })
      })

    })


  // BLOGGER and BLOGS ↓↓↓
  describe(`BLOGGER and BLOGS`, () => {
      it(`+ GET, should return 200 and empty arr`, async () => {
        const { userTest } = expect.getState()
        console.log(userTest, 2)
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
          .post(`/blogger/blogs`)
          .send(data)
          .expect(HttpStatus.UNAUTHORIZED)
      })

      it(`- POST, shouldn't create blog w/ incorrect data`, async () => {

        const data = {
          description: "My description",
          websiteUrl: "My websiteUrl",
        }

        const { accessTokenUser1 } = expect.getState()

        console.log("accessTokenUser1 = " + accessTokenUser1)


        const blogsResult = await request(httpServer)
          .post(`/blogger/blogs`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.BAD_REQUEST)

        expect(blogsResult.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              message: expect.any(String),
              field: "name"
            },
            {
              message: expect.any(String),
              field: "websiteUrl"
            }
          ])
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


      it(`+ POST, should create blog w/ correct data and authorized`,
        async () => {

          const { accessTokenUser1 } = expect.getState()

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
            .post(`/blogger/blogs`)
            .set("Authorization", `Bearer ${accessTokenUser1}`)
            .send(data)
            .expect(HttpStatus.CREATED)

          expect.setState({ createdNewBlog: newBlog.body })
          const { createdNewBlog } = expect.getState()

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


      it(`+ POST, should create blog w/ correct data and authorized`, async () => {

        const { accessTokenUser1 } = expect.getState()

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
          .post(`/blogger/blogs`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.CREATED)

        expect.setState({ createdNewBlog2: newBlog.body })

        const { createdNewBlog2 } = expect.getState()
        expect(createdNewBlog2).toEqual(testData)

        const existedBlogs = await request(httpServer)
          .get(`/blogs/${createdNewBlog2.id}`)
          .expect(HttpStatus.OK)

        expect(existedBlogs.body).toEqual(createdNewBlog2)
      })


      it(`+ POST, should create blog w/ correct data and authorized`, async () => {

        const { accessTokenUser1 } = expect.getState()

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
          .post(`/blogger/blogs`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.CREATED)

        expect.setState({ createdNewBlog3: newBlog.body })
        const { createdNewBlog3 } = expect.getState()

        expect(createdNewBlog3).toEqual(testData)
      })


      it(`+ POST, should create blog w/ correct data and authorized`, async () => {

        const { accessTokenUser1 } = expect.getState()

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
          .post(`/blogger/blogs`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.CREATED)

        expect.setState({ createdNewBlog4: newBlog.body })
        const { createdNewBlog4 } = expect.getState()

        expect(createdNewBlog4).toEqual(testData)
      })


      it(`+ POST, should create blog w/ correct data and authorized`, async () => {

        const { accessTokenUser1 } = expect.getState()

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
          .post(`/blogger/blogs`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.CREATED)

        expect.setState({ createdNewBlog5: newBlog.body })
        const {
          createdNewBlog5,
          createdNewBlog4,
          createdNewBlog3,
          createdNewBlog2,
          createdNewBlog
        } = expect.getState()

        expect(createdNewBlog5).toEqual(testData)


        let viewTestModel = {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 5,
          items: [
            createdNewBlog5,
            createdNewBlog4,
            createdNewBlog3,
            createdNewBlog2,
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
            createdNewBlog3,
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
            createdNewBlog2,
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
          .put(`/blogger/blogs/0`)
          .send(data)
          .expect(HttpStatus.UNAUTHORIZED)

      })


      it(`- PUT, shouldn't update unexisting blog `, async () => {

        const { accessTokenUser1 } = expect.getState()
        const getState = expect.getState()

        console.log("getState = " + getState.toString())

        const data = {
          name: "Jem",
          description: "My description",
          websiteUrl: "https://webapp.com",
        }

        const id = 0

        const resp = await request(httpServer)
          .put(`/blogger/blogs/${id}`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.BAD_REQUEST)

        expect(resp.body).toEqual({
          errorsMessages: [
            {
              message: expect.any(String),
              field: "id"
            }
          ]
        })
      })


      it(`- PUT, shouldn't update blog w/ incorrect data`, async () => {

        const { accessTokenUser1, createdNewBlog } = expect.getState()

        const data = {
          description: "My description",
        }

        const response = await request(httpServer)
          .put(`/blogger/blogs/${createdNewBlog.id}`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.BAD_REQUEST)

        expect(response.body).toEqual({
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

      })

      it(`+ PUT, should update blog`, async () => {

        const { accessTokenUser1, createdNewBlog } = expect.getState()

        const data = {
          name: "Ram",
          description: "Ram description",
          websiteUrl: "https://someurlRam.com"
        }

        await request(httpServer)
          .put(`/blogger/blogs/${createdNewBlog.id}`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .send(data)
          .expect(HttpStatus.NO_CONTENT)

        const resp = await request(httpServer)
          .get(`/blogs/${createdNewBlog.id}`)

        expect(resp.status).toEqual(HttpStatus.OK)

        expect.setState({ updatedBlog: resp.body })
        const { updatedBlog } = expect.getState()

        expect(updatedBlog).toEqual({
          ...createdNewBlog,
          name: data.name,
          description: data.description,
          websiteUrl: data.websiteUrl
        })
      })

      it(`- DELETE, shouldn't delete blog w/o authorization`, async () => {

        const { createdNewBlog, updatedBlog } = expect.getState()

        await request(httpServer)
          .delete(`/blogger/blogs/${createdNewBlog.id}`)
          .expect(HttpStatus.UNAUTHORIZED)

        const expectedBlog = await request(httpServer)
          .get(`/blogs/${createdNewBlog.id}`)
          .expect(HttpStatus.OK)

        expect(expectedBlog.body).toEqual(updatedBlog)

      })

      it(`- DELETE, shouldn't delete blog that doesn't exist`,
        async () => {

          const {
            accessTokenUser1,
            createdNewBlog,
            updatedBlog
          } = expect.getState()

          const deleteResult = await request(httpServer)
            .delete(`/blogger/blogs/000`)
            .set("Authorization", `Bearer ${accessTokenUser1}`)
            .expect(HttpStatus.BAD_REQUEST)

          expect(deleteResult.body).toEqual({
            errorsMessages: [
              {
                message: expect.any(String),
                field: "id"
              },
            ]
          })

          await request(httpServer)
            .get(`/blogs/${createdNewBlog.id}`)
            .expect(HttpStatus.OK, updatedBlog)
        })


      it(`- POST, shouldn't create POST of blog w/o authorization`,
        async () => {

          const { createdNewBlog } = expect.getState()

          const data = {
            title: "Gim",
            shortDescription: "Gim's shortDescription",
            content: "Gim's content"
          }

          await request(httpServer)
            .post(`/blogger/blogs/${createdNewBlog.id}/posts`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED)


          const postsResult = await request(httpServer)
            .get(`/blogs/${createdNewBlog.id}/posts`)
            .expect(HttpStatus.OK)

          expect(postsResult.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
          })
        })


      it(`- POST, shouldn't create POST of blog w/ incorrect data`,
        async () => {

          const { accessTokenUser1, createdNewBlog } = expect.getState()

          const data = {
            title: "Gim",
            description: "Gim's shortDescription", // ← incorrect key
            content: "Gim's content"
          }

          const newPost = await request(httpServer)
            .post(`/blogger/blogs/${createdNewBlog.id}/posts`)
            .set("Authorization", `Bearer ${accessTokenUser1}`)
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

          const postsResult = await request(httpServer)
            .get(`/blogs/${createdNewBlog.id}/posts`)
            .expect(HttpStatus.OK)

          expect(postsResult.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
          })

        })


      it(`+ POST, should create POST of blog w/ correct data and authorization`, async () => {

        const { accessTokenUser1, createdNewBlog } = expect.getState()

        const data = {
          title: "Gim",
          shortDescription: "Gim's shortDescription",
          content: "Gim's content"
        }

        const newPost = await request(httpServer)
          .post(`/blogger/blogs/${createdNewBlog.id}/posts`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
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

        expect.setState({ postCreatedNewBlog: newPost.body })
        const { postCreatedNewBlog } = expect.getState()

        expect(postCreatedNewBlog).toEqual(testData)

        await request(httpServer)
          .get(`/blogs/${createdNewBlog.id}/posts`)
          .expect(HttpStatus.OK, {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [postCreatedNewBlog]
          })

      })


      it
      (`+ POST, should create POST of blog w/ correct data and authorization`,
        async () => {

          const {
            accessTokenUser1,
            createdNewBlog,
            postCreatedNewBlog
          } = expect.getState()

          const data = {
            title: "Gim2",
            shortDescription: "Gim2's shortDescription",
            content: "Gim2's content"
          }

          const newPost = await request(httpServer)
            .post(`/blogger/blogs/${createdNewBlog.id}/posts`)
            .set("Authorization", `Bearer ${accessTokenUser1}`)
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

          expect.setState({ post2CreatedPostBlog: newPost.body })
          const { post2CreatedPostBlog } = expect.getState()

          expect(post2CreatedPostBlog).toEqual(testData)

          await request(httpServer)
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


      it(`+ DELETE, should delete blog`, async () => {

        const {
          accessTokenUser1,
          createdNewBlog5,
          createdNewBlog4,
          createdNewBlog3,
          createdNewBlog2,
          createdNewBlog,
        } = expect.getState()

        const viewTestModel = {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [
            createdNewBlog5,
            createdNewBlog4,
            createdNewBlog3,
            createdNewBlog2
          ]
        }

        await request(httpServer)
          .delete(`/blogger/blogs/${createdNewBlog.id}`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
          .get(`/blogs/${createdNewBlog.id}`)
          .expect(HttpStatus.NOT_FOUND)

        await request(httpServer)
          .get(`/blogs`)
          .expect(HttpStatus.OK, viewTestModel)

        await request(httpServer)
          .get(`/blogs/${createdNewBlog.id}/posts`)
          .set("Authorization", `Bearer ${accessTokenUser1}`)
          .expect(HttpStatus.NOT_FOUND)

      })
    }
  )

  // POSTS ↓↓↓
  describe(`POSTS`, () => {

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

      const postsResult = await request(httpServer)
        .get(`/posts/0`)
        .expect(HttpStatus.BAD_REQUEST,)

      expect(postsResult.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: "id"
          },
        ]
      })

    })


    it(`- POST, shouldn't creat post w/o authorization`,
      async () => {

        const { createdNewBlog } = expect.getState()

        const data = {
          title: "aaaaaaa",
          shortDescription: "bbbbbbbb",
          content: "cccccccccc",
        }

        await request(httpServer)
          .post(`blogger/blogs/${createdNewBlog._id.toString()}/posts`)
          .send(data)
          .expect(HttpStatus.UNAUTHORIZED)

        const postsResult = await request(httpServer)
          .get(`/posts`)
          .expect(HttpStatus.OK)

        expect(postsResult.body).toEqual(
          {
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
          }
        )

      })


    it(`- POST, shouldn't creat post, blogs doesn't exist`,
      async () => {

        const { accessTokenUser1 } = expect.getState()

        const data = {
          title: "aaaaaaa",
          shortDescription: "bbbbbbbb",
          content: "cccccccccc",
        }

        const postsResult = await request(httpServer)
          .post(`blogger/blogs/${(new Types.ObjectId).toString()}/posts`)
          .auth(accessTokenUser1, { type: "bearer" })
          .send(data)
          .expect(HttpStatus.BAD_REQUEST,)


        expect(postsResult.body).toEqual(
          {
            errorsMessages: [
              {
                message: expect.any(String),
                field: "blogId"
              }
            ]
          }
        )

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


    it(`- POST, should't create post w/ incorrect data`, async () => {

      const data = {
        // title: "aaaaaaa",
        shortDescription: "bbbbbbbb",
        content: "cccccccccc",
        blogId: "0",
      }

      await request(httpServer)
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

      const { createdNewBlog2 } = expect.getState()

      const data = {
        // title: "aaaaaaa",
        shortDescription: "bbbbbbbb",
        content: "cccccccccc",
        blogId: `${createdNewBlog2.id}`,
        blogName: `${createdNewBlog2.name}`
      }

      await request(httpServer)
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

      const { createdNewBlog2 } = expect.getState()

      const data = {
        title: "Rim",
        shortDescription: "Rim's shortDescription",
        content: "Rim's content",
        blogId: `${createdNewBlog2.id}`,
        blogName: expect.any(String),
        createdAt: expect.any(String),
      }

      const expectedPost = {
        ...data,
        id: expect.any(String)
      }

      const newPost = await request(httpServer)
        .post(`/posts`)
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .send(data)
        .expect(HttpStatus.CREATED)

      createdNewPost = newPost.body

      expect(createdNewPost).toEqual(expectedPost)
    })

    let createdNewPost2
    it(`+ POST, should create post`, async () => {

      const { createdNewBlog2 } = expect.getState()

      const data = {
        title: "Aim",
        shortDescription: "Aim's shortDescription",
        content: "Aim's content",
        blogId: `${createdNewBlog2.id}`,
        blogName: expect.any(String),
        createdAt: expect.any(String),
      }

      const expectedPost = {
        ...data,
        id: expect.any(String)
      }

      const newPost = await request(httpServer)
        .post(`/posts`)
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .send(data)
        .expect(HttpStatus.CREATED)

      createdNewPost2 = newPost.body

      expect(createdNewPost2).toEqual(expectedPost)
    })


    it(`+ GET, should return 200 and arr w/ two posts`, async () => {

      await request(httpServer)
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

      await request(httpServer)
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

      const { createdNewBlog2 } = expect.getState()

      const data = {
        title: "Rim",
        shortDescription: "Rim's shortDescription",
        content: "Rim's content",
        blogId: `${createdNewBlog2.id}`,
        blogName: `${createdNewBlog2.name}`
      }


      await request(httpServer)
        .put(`/posts/${createdNewPost.id}`)
        .send(data)
        .expect(HttpStatus.UNAUTHORIZED)

      await request(httpServer)
        .get(`/posts/${createdNewPost.id}`)
        .expect(HttpStatus.OK, createdNewPost)
    })

    it(`- PUT, should't update post, post does't exist`, async () => {

      const { createdNewBlog2 } = expect.getState()

      const data = {
        title: "Rim",
        shortDescription: "Rim's shortDescription",
        content: "Rim's content",
        blogId: `${createdNewBlog2.id}`,
      }

      await request(httpServer)
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

      const { createdNewBlog2 } = expect.getState()

      const data = {
        title: "Rimmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
        shortDescription: "Rim's shortDescription",
        content: "Rim's content",
        blogId: `${createdNewBlog2.id}`,
        blogName: `${createdNewBlog2.name}`
      }

      const MAX_LENGTH_TITLE = 30

      await request(httpServer)
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

      await request(httpServer)
        .put(`/posts/${createdNewPost.id}`)
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .send(data)
        .expect(HttpStatus.NO_CONTENT)

      const updatedPostBody = await request(httpServer)
        .get(`/posts/${createdNewPost.id}`)
        .expect(HttpStatus.OK)

      const updatedPost = updatedPostBody.body

      expect(updatedPost).toEqual(expectedPostToBe)
    })

    it(`- DELETE, should't delete post w/o auterization`, async () => {

      await request(httpServer)
        .delete(`/posts/${createdNewPost.id}`)
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it(`- DELETE, should't delete post does't exist`, async () => {

      await request(httpServer)
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

      await request(httpServer)
        .delete(`/posts/${createdNewPost.id}`)
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .expect(HttpStatus.NO_CONTENT)

      await request(httpServer)
        .get(`/posts/${createdNewPost.id}`)
        .expect(HttpStatus.NOT_FOUND)

      await request(httpServer)
        .get(`/posts/`)
        .expect(HttpStatus.OK, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [createdNewPost2]
        })

      await request(httpServer)
        .delete(`/posts/${createdNewPost2.id}`)
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .expect(HttpStatus.NO_CONTENT)


      await request(httpServer)
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


})