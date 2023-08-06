import { HttpStatus, INestApplication } from "@nestjs/common"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../src/app.module"
import { appSettings } from "../../src/app.settings"
import { TestingUser } from "./helpers/prepeared-data"
import { TestingRepository } from "../../src/infrastructure/testing/infrastructure/testing.repository"
import { RegistrationBodyInputModel } from "../../src/features/auth/api/models/input/registration.body.input-model"
import { assignToken } from "@nestjs/core/middleware/utils"

describe
("Blogger endpoints", () => {
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

    const testingUser: TestingUser = new TestingUser(server)
    // testingUser = new TestingUser(server)
    // testingBlog = new TestingBlog(server)
    // testingPost = new TestingPost(server)
    // testingPost = new TestingPost(server)
    // testingComment = new TestingComment(server)

    const testingRepository: TestingRepository = app.get(TestingRepository)

    expect.setState({
      mongoMemoryServer,
      app,
      server,
      testingUser,
      testingRepository
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
      const { testingUser }: { testingUser: TestingUser } = expect.getState() as any

      const registrationResultUser1 = await testingUser.registrationUser()
      expect(registrationResultUser1.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser1: { ...registrationResultUser1.inputUserData } })
    })

    it
    (`+ Registration-confirmation user`, async () => {
      const { inputDataUser1, testingUser, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingUser: TestingUser,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.login })
      expect(user1).not.toBeNull()
      expect(user1?.emailConfirmation.confirmationCode).not.toBeNull()

      const confirmationResultUser1 = await testingUser.registrationConfirmationUser(user1!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ Login user`, async () => {
      const { inputDataUser1, testingUser, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingUser: TestingUser,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.login })
      expect(user1).toBeDefined()
      expect(user1?.emailConfirmation.confirmationCode).toBeDefined()

      const loginResultUser1 = await testingUser.loginUser({
        loginOrEmail: inputDataUser1.login || inputDataUser1.email,
        password: inputDataUser1.password
      })

      expect(loginResultUser1.status).toEqual(HttpStatus.OK)
      expect(loginResultUser1.accessToken).toEqual(expect.any(String))
      expect(loginResultUser1.refreshToken).toEqual(expect.any(String))
    })

  })

})