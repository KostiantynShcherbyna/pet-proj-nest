import { HttpStatus, INestApplication } from "@nestjs/common"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../src/app.module"
import { appSettings } from "../../src/app.settings"
import { TestingAuth } from "./helpers/requests.helper"
import { TestingRepository } from "../../src/infrastructure/testing/infrastructure/testing.repository"
import { RegistrationBodyInputModel } from "../../src/features/auth/api/models/input/registration.body.input-model"
import { assignToken } from "@nestjs/core/middleware/utils"
import { AuthRepository } from "../../src/features/auth/infrastructure/auth.repository"
import { faker } from "@faker-js/faker"
import { PasswordRecovery } from "../../src/features/auth/application/use-cases/password-recovery.use-case"
import { RecoveryCodesDocument } from "../../src/features/auth/application/entitys/recovery-code.schema"

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

    const testingAuth: TestingAuth = new TestingAuth(server)
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

      testingAuth,
      testingRepository,
      authRepository,
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
      const { testingAuth }: { testingAuth: TestingAuth } = expect.getState() as any

      const registrationResultUser = await testingAuth.registration()
      expect(registrationResultUser.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser1: { ...registrationResultUser.inputUserData } })
    })

    it
    (`+ Registration-confirmation user`, async () => {
      const { inputDataUser1, testingAuth, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.login })
      expect(user1).not.toBeNull()
      expect(user1?.emailConfirmation.confirmationCode).not.toBeNull()

      const confirmationResultUser1 = await testingAuth.registrationConfirmation(user1!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ Login user`, async () => {
      const { inputDataUser1, testingAuth, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
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
    })

  })

  describe
  (`AUTH`, () => {

    it
    (`+ registration`, async () => {
      const { testingAuth }: { testingAuth: TestingAuth } = expect.getState() as any

      const registrationResultUser = await testingAuth.registration()
      expect(registrationResultUser.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser2: { ...registrationResultUser.inputUserData } })
    })

    it
    (`+ registration-email-resending`, async () => {
      const { inputDataUser2, testingAuth, testingRepository }: {
        inputDataUser2: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user2 = await testingRepository.getUser({ loginOrEmail: inputDataUser2.email })
      expect(user2).not.toBeNull()
      expect(user2?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user2?.emailConfirmation.isConfirmed).toEqual(false)

      const resendingUser2 = await testingAuth.registrationEmailResending(user2!.accountData.email)
      expect(resendingUser2.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ registration-confirmation`, async () => {
      const { inputDataUser2, testingAuth, testingRepository }: {
        inputDataUser2: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user2 = await testingRepository.getUser({ loginOrEmail: inputDataUser2.login })
      expect(user2).not.toBeNull()
      expect(user2?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user2?.emailConfirmation.isConfirmed).toEqual(false)

      const confirmationResultUser2 = await testingAuth.registrationConfirmation(user2!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser2.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ login`, async () => {
      const { inputDataUser2, testingAuth, testingRepository }: {
        inputDataUser2: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user2 = await testingRepository.getUser({ loginOrEmail: inputDataUser2.login })
      expect(user2).toBeDefined()
      expect(user2?.emailConfirmation.confirmationCode).toBeDefined()

      const loginResultUser2 = await testingAuth.login({
        loginOrEmail: inputDataUser2.login || inputDataUser2.email,
        password: inputDataUser2.password
      })

      expect(loginResultUser2.status).toEqual(HttpStatus.OK)
      expect(loginResultUser2.accessToken).toEqual(expect.any(String))
      expect(loginResultUser2.refreshToken).toEqual(expect.any(String))

      expect.setState({
        accessTokenUser2: loginResultUser2.accessToken,
        refreshTokenUser2: loginResultUser2.refreshToken
      })
    })

    it
    (`+ refresh-token`, async () => {
      const { inputDataUser2, testingAuth, testingRepository, refreshTokenUser2 }: {
        inputDataUser2: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
        testingRepository: TestingRepository,
        refreshTokenUser2: string,
      } = expect.getState() as any

      const user2 = await testingRepository.getUser({ loginOrEmail: inputDataUser2.login })
      expect(user2).toBeDefined()

      const refreshTokenResultUser2 = await testingAuth.refreshToken(refreshTokenUser2)

      expect(refreshTokenResultUser2.status).toEqual(HttpStatus.OK)
      expect(refreshTokenResultUser2.accessToken).toEqual(expect.any(String))
      expect(refreshTokenResultUser2.refreshToken).toEqual(expect.any(String))
    })

    it
    (`+ password-recovery`, async () => {
      const { inputDataUser2, testingAuth, testingRepository, authRepository }: {
        inputDataUser2: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
        testingRepository: TestingRepository,
        authRepository: AuthRepository,
      } = expect.getState() as any

      const user2 = await testingRepository.getUser({ loginOrEmail: inputDataUser2.email })
      expect(user2).toBeDefined()

      const passwordRecoveryResultUser2 = await testingAuth.passwordRecovery(user2!.accountData.email)

      expect(passwordRecoveryResultUser2.status).toEqual(HttpStatus.NO_CONTENT)

      const passwordRecoveryCodeUser2 = await authRepository.findRecoveryCode(user2!.accountData.email)
      expect.setState({ passwordRecoveryCodeUser2 })
      console.log("passwordRecoveryCodeUser2", passwordRecoveryCodeUser2, 1)
    })

    it
    (`+ new-password`, async () => {
      const { inputDataUser2, testingAuth, testingRepository, passwordRecoveryCodeUser2 }: {
        inputDataUser2: RegistrationBodyInputModel,
        testingAuth: TestingAuth,
        testingRepository: TestingRepository,
        passwordRecoveryCodeUser2: RecoveryCodesDocument,
      } = expect.getState() as any

      const user2 = await testingRepository.getUser({ loginOrEmail: inputDataUser2.login })
      expect(user2).toBeDefined()
      console.log("passwordRecoveryCodeUser2", passwordRecoveryCodeUser2, 2)
      const newPasswordResultUser2 = await testingAuth.newPassword({
        newPassword: faker.internet.password(),
        recoveryCode: passwordRecoveryCodeUser2.recoveryCode,
      })

      expect(newPasswordResultUser2.status).toEqual(HttpStatus.NO_CONTENT)
    })

  })

})