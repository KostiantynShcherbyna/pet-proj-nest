import { HttpStatus, INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../src/app.module"
import { appSettings } from "../../src/app.settings"
import { PublicTestingHelper } from "./helpers/public-testing.helper"
import { TestingRepository } from "../../src/infrastructure/testing/infrastructure/testing.repository"
import { AuthRepository } from "../../src/features/auth/repository/mongoose/auth.repository"
import { faker } from "@faker-js/faker"
import { BloggerTestingHelper } from "./helpers/blogger-testing.helper"
import {
  CreateBloggerBlogOutputModel
} from "../../src/features/blogger/api/models/output/create-blogger-blog.output-model"
import { LikeStatus } from "../../src/infrastructure/utils/constants"
import {
  CreateBloggerPostOutputModel
} from "../../src/features/blogger/api/models/output/create-blogger-post.output-model"
import { EmailAdapter } from "../../src/infrastructure/adapters/email.adapter"
import { EmailAdapterMock } from "../../src/infrastructure/testing/infrastructure/email-adapter.mock"
import request from "supertest"
import { SaTestingHelper, superUser } from "./helpers/sa-testing.helper"
import { CreateUserOutputModel } from "../../src/features/sa/api/models/output/create-user.output-model"
import { CreateUserBodyInputModel } from "../../src/features/sa/api/models/input/create-user.body.input-model"
import { endpoints } from "./helpers/routing.helper"
import { configuration } from "../../src/infrastructure/settings/configuration"
import { DataSource } from "typeorm"

describe
("pet-proj-nest-orm", () => {
  const second = 1000
  const minute = 60 * second

  jest.setTimeout(5 * minute)

  let app
  let server: INestApplication
  let testingRepository: TestingRepository
  let publicHelper: PublicTestingHelper
  let bloggerHelper: BloggerTestingHelper
  let saHelper: SaTestingHelper

  let authRepository: AuthRepository

  beforeAll
  (async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(EmailAdapter)
      .useClass(EmailAdapterMock)
      .compile()

    app = await moduleFixture.createNestApplication()
    app = appSettings(app)
    await app.init()
    server = app.getHttpServer()

    testingRepository = app.get(TestingRepository)
    publicHelper = new PublicTestingHelper(server)
    saHelper = new SaTestingHelper(server)
    bloggerHelper = new BloggerTestingHelper(server)
    authRepository = app.get(AuthRepository)

    // const dataSource = await app.resolve(DataSource)

    await request(server).delete(`/testing/all-data`)
  })

  afterAll
  (async () => {
    await request(server).delete(`/testing/all-data`)
    await app.close()
  })


  describe
  (`AUTH`, () => {

    let inputDataUser0: CreateUserBodyInputModel
    it(`+ registration user0`, async () => {
      inputDataUser0 = {
        login: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password()
      }
      const response = await request(server)
        .post(endpoints.authController.registration())
        .send(inputDataUser0)

      expect(response.status).toEqual(HttpStatus.NO_CONTENT)
    })

    let user0: CreateUserOutputModel
    it("+ get users ", async () => {
      const response = await request(server)
        .get(endpoints.saController.getUsers())
        .auth(superUser.login, superUser.password, { type: "basic" })

      const usersView = {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [{
          id: expect.any(String),
          login: inputDataUser0.login,
          email: inputDataUser0.email,
          createdAt: expect.any(String),
          banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null,
          }
        }]
      }
      expect(response.body).toEqual(usersView)
      user0 = response.body.items[0]
    })


    it(`+ registration-email-resending`, async () => {
      const user0 = await testingRepository.findUserByLoginOrEmail({
        login: inputDataUser0.login,
        email: inputDataUser0.email,
      })
      expect(user0).not.toBeNull()
      expect(user0?.confirmationCode).not.toBeNull()
      expect(user0?.isConfirmed).toEqual(false)

      const response = await request(server)
        .post(endpoints.authController.registrationEmailResending())
        .send({ email: user0.email })

      expect(response.status).toEqual(HttpStatus.NO_CONTENT)
    })


    it(`+ registration-confirmation`, async () => {
      const user0 = await testingRepository.findUserByLoginOrEmail({
        login: inputDataUser0.login,
        email: inputDataUser0.email,
      })
      const response = await request(server)
        .post(endpoints.authController.registrationConfirmation())
        .send({ code: user0.confirmationCode })

      expect(response.status).toEqual(HttpStatus.NO_CONTENT)
    })

    let saUserViews: CreateUserOutputModel[] = []
    let saUsersInputModel: CreateUserBodyInputModel[] = []
    it("+ create User or Users by SA", async () => {
      const createSaUsersResult = await saHelper.createUsers(4)

      expect(createSaUsersResult).toHaveLength(4)
      createSaUsersResult.forEach(saUserResult => {
        expect(saUserResult.status).toEqual(HttpStatus.CREATED)
        expect(saUserResult.body.id).toEqual(expect.any(String))
        expect(saUserResult.body.login).toEqual(expect.any(String))
        expect(saUserResult.body.email).toEqual(expect.any(String))
        expect(saUserResult.body.createdAt).toEqual(expect.any(String))
        expect(saUserResult.body.banInfo.isBanned).toBeFalsy()
        expect(saUserResult.body.banInfo.banDate).toBeNull()
        expect(saUserResult.body.banInfo.banReason).toBeNull()
        saUserViews.push(saUserResult.body)
        saUsersInputModel.push(saUserResult.inputUserData)
      })

    })

    let loginResults: { login: string, accessToken: string, refreshToken: string }[] = []
    it(`+ login`, async () => {
      const LoginBodyInputModels = [
        { loginOrEmail: inputDataUser0.login, password: inputDataUser0.password },
        { loginOrEmail: saUserViews[0].login, password: saUsersInputModel[0].password },
        { loginOrEmail: saUserViews[1].login, password: saUsersInputModel[1].password },
        { loginOrEmail: saUserViews[2].login, password: saUsersInputModel[2].password },
        { loginOrEmail: saUserViews[3].login, password: saUsersInputModel[3].password },
      ]

      const loginUserResults = await publicHelper.loginUsers(LoginBodyInputModels)
      loginUserResults.forEach(result => {
        expect(result.status).toEqual(HttpStatus.OK)
        expect(result.accessToken).toEqual(expect.any(String))
        expect(result.refreshToken).toEqual(expect.any(String))
        loginResults.push({
          login: result.loginOrEmail,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        })
      })
    })


    let blog0ofUser0: CreateBloggerBlogOutputModel
    it("+ create blog0 of user0", async () => {
      const createBlogByUser0Result = await bloggerHelper.createBlog(loginResults[0].accessToken)
      expect(createBlogByUser0Result.status).toEqual(HttpStatus.CREATED)
      expect(createBlogByUser0Result.body).toEqual({
        ...createBlogByUser0Result.inputBlogData,
        id: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      })
      blog0ofUser0 = createBlogByUser0Result.body
    })

    let post0ofBlog0ofUser0: CreateBloggerBlogOutputModel
    it("+ create post0 of blog0 of user0", async () => {
      const createPost0ofBlog0ofUser0Result = await bloggerHelper.createPost(loginResults[0].accessToken, blog0ofUser0.id)
      expect(createPost0ofBlog0ofUser0Result.status).toEqual(HttpStatus.CREATED)
      expect(createPost0ofBlog0ofUser0Result.body).toEqual({
        ...createPost0ofBlog0ofUser0Result.inputPostData,
        id: expect.any(String),
        blogId: blog0ofUser0.id,
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: LikeStatus.None,
          newestLikes: []
        }
      })
      post0ofBlog0ofUser0 = createPost0ofBlog0ofUser0Result.body
    })

    let comment0ofPost0ofBlog0ofUser0: CreateBloggerPostOutputModel
    it("+ create comment0 of post0 of blog0 of user0", async () => {
      const comment0ofPost0ofBlog0ofUser0Result = await publicHelper.createComment(loginResults[0].accessToken, post0ofBlog0ofUser0.id)
      expect(comment0ofPost0ofBlog0ofUser0Result.status).toBe(HttpStatus.CREATED)
      expect(comment0ofPost0ofBlog0ofUser0Result.body.id).toEqual(expect.any(String))
      expect(comment0ofPost0ofBlog0ofUser0Result.body.content).toEqual(expect.any(String))
      expect(comment0ofPost0ofBlog0ofUser0Result.body.commentatorInfo.userId).toEqual(user0.id)
      expect(comment0ofPost0ofBlog0ofUser0Result.body.commentatorInfo.userLogin).toEqual(user0.login)
      expect(comment0ofPost0ofBlog0ofUser0Result.body.createdAt).toBeDefined()
      expect(comment0ofPost0ofBlog0ofUser0Result.body.likesInfo.likesCount).toEqual(0)
      expect(comment0ofPost0ofBlog0ofUser0Result.body.likesInfo.dislikesCount).toEqual(0)
      expect(comment0ofPost0ofBlog0ofUser0Result.body.likesInfo.myStatus).toEqual(LikeStatus.None)

      comment0ofPost0ofBlog0ofUser0 = comment0ofPost0ofBlog0ofUser0Result.body
    })


    it("+ get comment0 of post0 of blog0 of user0", async () => {
      const comment0ofPost0ofBlog0ofUser0Result = await publicHelper.getComment(loginResults[0].accessToken, comment0ofPost0ofBlog0ofUser0.id)
      expect(comment0ofPost0ofBlog0ofUser0Result.status).toBe(HttpStatus.OK)
      expect(comment0ofPost0ofBlog0ofUser0Result.body).toEqual(comment0ofPost0ofBlog0ofUser0)
    })

  })

})


