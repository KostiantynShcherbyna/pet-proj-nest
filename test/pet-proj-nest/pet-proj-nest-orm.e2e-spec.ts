import { HttpStatus, INestApplication } from "@nestjs/common"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../src/app.module"
import { appSettings } from "../../src/app.settings"
import { PublicTestingHelper } from "./helpers/public-testing.helper"
import { TestingRepository } from "../../src/infrastructure/testing/infrastructure/testing.repository"
import { RegistrationBodyInputModel } from "../../src/features/auth/api/models/input/registration.body.input-model"
import { AuthRepository } from "../../src/features/auth/repository/mongoose/auth.repository"
import { faker } from "@faker-js/faker"
import { RecoveryCodesDocument } from "../../src/features/auth/application/entities/mongoose/recovery-code.schema"
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
import { MeOutputModel } from "../../src/features/auth/api/models/output/me-output.model"
import { SaTestingHelper, superUser } from "./helpers/sa-testing.helper"
import { CreateUserOutputModel } from "../../src/features/sa/api/models/output/create-user.output-model"
import { UsersDocument } from "../../src/features/sa/application/entities/mongoose/users.schema"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RecoveryCodeEntity } from "../../src/features/auth/application/entities/sql/recovery-code.entity"
import { BanBlogUserEntity } from "../../src/features/blogs/application/entities/sql/ban-blog-user.entity"
import { BlogEntity } from "../../src/features/blogs/application/entities/sql/blog.entity"
import { CommentEntity } from "../../src/features/comments/application/entities/sql/comment.entity"
import { CommentLikeEntity } from "../../src/features/comments/application/entities/sql/comment-like.entity"
import { DeviceEntity } from "../../src/features/devices/application/entites/sql/device.entity"
import { PostLikeEntity } from "../../src/features/posts/application/entites/sql/post-like.entity"
import { PostEntity } from "../../src/features/posts/application/entites/sql/post.entity"
import { AccountEntity } from "../../src/features/sa/application/entities/sql/account.entity"
import { BanInfoEntity } from "../../src/features/sa/application/entities/sql/ban-info.entity"
import { EmailConfirmationEntity } from "../../src/features/sa/application/entities/sql/email-confirmation.entity"
import {
  SentConfirmationCodeDateEntity
} from "../../src/features/sa/application/entities/sql/sent-confirmation-code-date.entity"
import { CreateUserBodyInputModel } from "../../src/features/sa/api/models/input/create-user.body.input-model"
import { endpoints } from "./helpers/routing.helper"
import { LoginBodyInputModel } from "../../src/features/auth/api/models/input/login.body.input-model"

describe
("pet-proj-nest-orm", () => {
  const second = 1000
  const minute = 60 * second

  jest.setTimeout(5 * minute)

  let app
  let server: INestApplication
  let testingRepository: TestingRepository
  let publicTestingHelper: PublicTestingHelper
  let saTestingHelper: SaTestingHelper
  let authRepository: AuthRepository

  beforeAll
  (async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        // TypeOrmModule.forRoot({
        //   type: "postgres",
        //   host: "localhost",
        //   port: 5432,
        //   username: "nestjsk",
        //   password: "nestjsk",
        //   database: "pet-proj-nest-orm-db-tests",
        //   entities: [
        //     RecoveryCodeEntity,
        //     BanBlogUserEntity,
        //     BlogEntity,
        //     CommentEntity,
        //     CommentLikeEntity,
        //     DeviceEntity,
        //     PostLikeEntity,
        //     PostEntity,
        //     AccountEntity,
        //     BanInfoEntity,
        //     EmailConfirmationEntity,
        //     SentConfirmationCodeDateEntity,
        //   ],
        //   autoLoadEntities: true,
        //   synchronize: true,
        // })
      ],
    })
      .overrideProvider(EmailAdapter)
      .useClass(EmailAdapterMock)
      .compile()

    app = await moduleFixture.createNestApplication()
    app = appSettings(app)
    await app.init()
    server = app.getHttpServer()

    testingRepository = app.get(TestingRepository)
    publicTestingHelper = new PublicTestingHelper(server)
    saTestingHelper = new SaTestingHelper(server)
    authRepository = app.get(AuthRepository)

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
    it(`+ registration`, async () => {
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
    let saUsersData: CreateUserBodyInputModel[] = []
    it("+ create User or Users by SA", async () => {
      const createSaUsersResult = await saTestingHelper.createUsers(4)

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
        saUsersData.push(saUserResult.inputUserData)
      })

    })

    let loginResults: { login: string, accessToken: string, refreshToken: string }[] = []
    it(`+ login`, async () => {
      const LoginBodyInputModels = [
        { loginOrEmail: inputDataUser0.login, password: inputDataUser0.password },
        { loginOrEmail: saUserViews[0].login, password: saUsersData[0].password },
        { loginOrEmail: saUserViews[1].login, password: saUsersData[1].password },
        { loginOrEmail: saUserViews[2].login, password: saUsersData[2].password },
        { loginOrEmail: saUserViews[3].login, password: saUsersData[3].password },
      ]

      const loginUserResults = await publicTestingHelper.loginUsers(LoginBodyInputModels)
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


  })

})


