import { HttpStatus, INestApplication } from "@nestjs/common"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../src/app.module"
import { appSettings } from "../../src/app.settings"
import { AuthTestingHelper } from "./helpers/auth-testing.helper"
import { TestingRepository } from "../../src/infrastructure/testing/infrastructure/testing.repository"
import { RegistrationBodyInputModel } from "../../src/features/auth/api/models/input/registration.body.input-model"
import { assignToken } from "@nestjs/core/middleware/utils"
import { AuthRepository } from "../../src/features/auth/infrastructure/auth.repository"
import { faker } from "@faker-js/faker"
import { PasswordRecovery } from "../../src/features/auth/application/use-cases/password-recovery.use-case"
import { RecoveryCodesDocument } from "../../src/features/auth/application/entitys/recovery-code.schema"
import { BloggerTestingHelper } from "./helpers/blogger-testing.helper"
import { Blogs, BlogsDocument } from "../../src/features/blogger/application/entity/blogs.schema"
import {
  CreateBloggerBlogOutputModel
} from "../../src/features/blogger/api/models/output/create-blogger-blog.output-model"
import { LikeStatus } from "../../src/infrastructure/utils/constants"

describe
("pet-proj-nest", () => {
  const second = 1000
  const minute = 60 * second

  jest.setTimeout(5 * minute)

  // let mongoMemoryServer: MongoMemoryServer
  // let app: INestApplication
  // let server

  // let testingUser: TestingUser
  // let testingBlog: TestingBlog
  // let testingPost: TestingPost
  // let testingComment: TestingComment

  beforeAll
  (async () => {
    const mongoMemoryServer = await MongoMemoryServer.create()
    const mongoUri = mongoMemoryServer.getUri()
    process.env["MONGOOSE_URI"] = mongoUri

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    let app = await moduleFixture.createNestApplication()
    app = appSettings(app)
    await app.init()
    const server = app.getHttpServer()

    const testingAuth: AuthTestingHelper = new AuthTestingHelper(server)
    const testingBlogger: BloggerTestingHelper = new BloggerTestingHelper(server)
    // testingBlog = new TestingBlog(server)
    // testingPost = new TestingPost(server)
    // testingPost = new TestingPost(server)
    // testingComment = new TestingComment(server)

    const testingRepository: TestingRepository = app.get(TestingRepository)
    const authRepository: AuthRepository = app.get(AuthRepository)

    expect.setState({
      mongoMemoryServer,
      app,
      server,

      testingRepository,
      testingAuth,
      authRepository,
      testingBlogger,
    })

  })

  afterAll
  (async () => {

    const { mongoMemoryServer, app }: {
      mongoMemoryServer: MongoMemoryServer,
      app: INestApplication
    } = expect.getState() as any

    await app.close()
    await mongoMemoryServer.stop()
  })

  describe
  (`REGISTRATION and REGISTRATION-CONFIRMATION and LOGIN`, () => {

    it
    (`+ Registration user`, async () => {
      const { testingAuth }: { testingAuth: AuthTestingHelper } = expect.getState() as any

      const registrationResultUser = await testingAuth.registration()
      expect(registrationResultUser.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser: { ...registrationResultUser.inputUserData } })
    })

    it
    (`+ Registration-confirmation user`, async () => {
      const { inputDataUser, testingAuth, testingRepository }: {
        inputDataUser: RegistrationBodyInputModel,
        testingAuth: AuthTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user = await testingRepository.getUser({ loginOrEmail: inputDataUser.login })
      expect(user).not.toBeNull()
      expect(user?.emailConfirmation.confirmationCode).not.toBeNull()

      const confirmationResultUser = await testingAuth.registrationConfirmation(user!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ Login user`, async () => {
      const { inputDataUser, testingAuth, testingRepository }: {
        inputDataUser: RegistrationBodyInputModel,
        testingAuth: AuthTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user = await testingRepository.getUser({ loginOrEmail: inputDataUser.login })
      expect(user).toBeDefined()
      expect(user?.emailConfirmation.confirmationCode).toBeDefined()

      const loginResultUser = await testingAuth.login({
        loginOrEmail: inputDataUser.login || inputDataUser.email,
        password: inputDataUser.password
      })
      expect(loginResultUser.status).toEqual(HttpStatus.OK)
      expect(loginResultUser.accessToken).toEqual(expect.any(String))
      expect(loginResultUser.refreshToken).toEqual(expect.any(String))

      expect.setState({
        accessTokenUser: loginResultUser.accessToken,
        refreshTokenUser: loginResultUser.refreshToken,
      })
    })

  })


  describe
  (`AUTH`, () => {

    it
    (`+ registration`, async () => {
      const { testingAuth }: { testingAuth: AuthTestingHelper } = expect.getState() as any

      const registrationResultUser1 = await testingAuth.registration()
      expect(registrationResultUser1.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser1: { ...registrationResultUser1.inputUserData } })
    })

    it
    (`+ registration-email-resending`, async () => {
      const { inputDataUser1, testingAuth, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingAuth: AuthTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.email })
      expect(user1).not.toBeNull()
      expect(user1?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user1?.emailConfirmation.isConfirmed).toEqual(false)

      const resendingUser1 = await testingAuth.registrationEmailResending(inputDataUser1.email)
      expect(resendingUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ registration-confirmation`, async () => {
      const { inputDataUser1, testingAuth, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingAuth: AuthTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.login })
      expect(user1).not.toBeNull()
      expect(user1?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user1?.emailConfirmation.isConfirmed).toEqual(false)

      const confirmationResultUser1 = await testingAuth.registrationConfirmation(user1!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ login`, async () => {
      const { inputDataUser1, testingAuth, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingAuth: AuthTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.login })
      expect(user1).toBeDefined()
      expect(user1?.emailConfirmation.confirmationCode).toBeDefined()

      const loginResultUser1 = await testingAuth.login({
        loginOrEmail: inputDataUser1.login || inputDataUser1.email,
        password: inputDataUser1.password
      })
      expect(loginResultUser1.status).toEqual(HttpStatus.OK)
      expect(loginResultUser1.accessToken).toEqual(expect.any(String))
      expect(loginResultUser1.refreshToken).toEqual(expect.any(String))

      expect.setState({
        accessTokenUser1: loginResultUser1.accessToken,
        refreshTokenUser1: loginResultUser1.refreshToken
      })
    })

    it
    (`+ refresh-token`, async () => {
      const { testingAuth, refreshTokenUser1 }: {
        testingAuth: AuthTestingHelper,
        refreshTokenUser1: string,
      } = expect.getState() as any

      const refreshTokenResultUser1 = await testingAuth.refreshToken(refreshTokenUser1)
      expect(refreshTokenResultUser1.status).toEqual(HttpStatus.OK)
      expect(refreshTokenResultUser1.accessToken).toEqual(expect.any(String))
      expect(refreshTokenResultUser1.refreshToken).toEqual(expect.any(String))

      expect.setState({
        accessTokenUser1_1: refreshTokenResultUser1.accessToken,
        refreshTokenUser1_1: refreshTokenResultUser1.refreshToken,
      })
    })

    it
    (`+ password-recovery`, async () => {
      const { inputDataUser1, testingAuth, testingRepository, authRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingAuth: AuthTestingHelper,
        testingRepository: TestingRepository,
        authRepository: AuthRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.email })
      expect(user1).toBeDefined()

      const passwordRecoveryResultUser1 = await testingAuth.passwordRecovery(user1!.accountData.email)
      expect(passwordRecoveryResultUser1.status).toEqual(HttpStatus.NO_CONTENT)

      const passwordRecoveryCodeUser1 = await authRepository.findRecoveryCode(user1!.accountData.email)
      expect.setState({ passwordRecoveryCodeUser1 })
    })

    it
    (`+ new-password`, async () => {
      const { testingAuth, passwordRecoveryCodeUser1 }: {
        testingAuth: AuthTestingHelper,
        passwordRecoveryCodeUser1: RecoveryCodesDocument,
      } = expect.getState() as any

      const newPasswordResultUser1 = await testingAuth.newPassword({
        newPassword: faker.internet.password(),
        recoveryCode: passwordRecoveryCodeUser1.recoveryCode,
      })
      expect(newPasswordResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ me`, async () => {
      const { testingAuth, accessTokenUser1_1 }: {
        testingAuth: AuthTestingHelper,
        accessTokenUser1_1: string,
      } = expect.getState() as any

      const meResultUser1 = await testingAuth.me(accessTokenUser1_1)
      expect(meResultUser1.status).toEqual(HttpStatus.OK)
    })

    it
    (`+ logout`, async () => {
      const { testingAuth, refreshTokenUser1_1 }: {
        testingAuth: AuthTestingHelper,
        refreshTokenUser1_1: string,
      } = expect.getState() as any

      const logoutResultUser1 = await testingAuth.logout(refreshTokenUser1_1)
      expect(logoutResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

  })

  describe
  (`BLOGGER`, () => {

    // it
    // ("+ Post blog", async () => {
    //   const { testingBlogger, accessTokenUser }: {
    //     testingBlogger: BloggerTestingHelper,
    //     accessTokenUser: string,
    //   } = expect.getState() as any
    //
    //   const createBlogByUserResult = await testingBlogger.createBlog(accessTokenUser)
    //   expect(createBlogByUserResult.status).toEqual(HttpStatus.CREATED)
    //   expect(createBlogByUserResult.body).toEqual({
    //     ...createBlogByUserResult.inputBlogData,
    //     id: expect.any(String),
    //     createdAt: expect.any(String),
    //     isMembership: expect.any(Boolean),
    //   })
    //
    //   expect.setState({ blogOfUser: createBlogByUserResult.body })
    // })

    it
    ("+ Post blog or blogs", async () => {
      const { testingBlogger, accessTokenUser }: {
        testingBlogger: BloggerTestingHelper,
        accessTokenUser: string,
      } = expect.getState() as any

      const createBlogByUserResult = await testingBlogger.createBlogs(accessTokenUser, 1)

      const blogsOfUser: CreateBloggerBlogOutputModel[] = []
      for (let i = 0; i < createBlogByUserResult.length; i++) {
        expect(createBlogByUserResult[i].status).toEqual(HttpStatus.CREATED)
        expect(createBlogByUserResult[i].body).toEqual(
          {
            ...createBlogByUserResult[i].inputBlogData,
            id: expect.any(String),
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          }
        )
        blogsOfUser.push(createBlogByUserResult[i].body)
      }

      expect.setState(blogsOfUser)
    })

    it
    ("+ Get blogs", async () => {
      const { testingBlogger, accessTokenUser, blogOfUser }: {
        testingBlogger: BloggerTestingHelper,
        accessTokenUser: string,
        blogOfUser: CreateBloggerBlogOutputModel
      } = expect.getState() as any

      const getBlogsOfUserResult = await testingBlogger.getBlogs(accessTokenUser)
      expect(getBlogsOfUserResult.status).toEqual(HttpStatus.OK)
      expect(getBlogsOfUserResult.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blogOfUser]
      })
    })

    it
    ("+ Post post", async () => {
      const { testingBlogger, accessTokenUser, blogOfUser }: {
        testingBlogger: BloggerTestingHelper,
        accessTokenUser: string,
        blogOfUser: CreateBloggerBlogOutputModel
      } = expect.getState() as any

      const createPostOfBlogResult = await testingBlogger.createPost(accessTokenUser, blogOfUser.id)
      expect(createPostOfBlogResult.status).toEqual(HttpStatus.CREATED)
      expect(createPostOfBlogResult.body).toEqual({
        ...createPostOfBlogResult.inputPostData,
        id: expect.any(String),
        blogId: blogOfUser.id,
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: LikeStatus.None,
          newestLikes: []
        }
      })
    })


  })

})