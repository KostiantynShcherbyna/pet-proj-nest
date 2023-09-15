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
import { CreateUserBodyInputModel } from "../../src/features/sa/api/models/input/users/create-user.body.input-model"
import { endpoints } from "./helpers/routing.helper"
import { configuration } from "../../src/infrastructure/settings/configuration"
import { DataSource } from "typeorm"
import { Question } from "../../src/features/quiz/application/entities/typeorm/question"
import { IInsertQuestionOutputModel } from "../../src/features/sa/api/models/output/insert-question.output-model"
import { LoginBodyInputModel } from "../../src/features/auth/api/models/input/login.body.input-model"
import { QuizStatusEnum } from "../../src/features/quiz/application/entities/typeorm/game"

interface ILoginResult {
  login: string
  accessToken: string
  refreshToken: string
}

describe
("quiz", () => {
  const second = 1000
  const minute = 60 * second

  jest.setTimeout(5 * minute)

  let app
  let server: INestApplication
  // let testingRepository: TestingRepository
  let publicHelper: PublicTestingHelper
  // let bloggerHelper: BloggerTestingHelper
  let saHelper: SaTestingHelper

  // let authRepository: AuthRepository

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

    // testingRepository = app.get(TestingRepository)
    publicHelper = new PublicTestingHelper(server)
    saHelper = new SaTestingHelper(server)
    // bloggerHelper = new BloggerTestingHelper(server)
    // authRepository = app.get(AuthRepository)

    // const dataSource = await app.resolve(DataSource)

    await request(server).delete(`/testing/all-data`)
  })

  afterAll
  (async () => {
    await request(server).delete(`/testing/all-data`)
    await app.close()
  })


  let inputDataUser_0: CreateUserBodyInputModel
  let inputDataUser_1: CreateUserBodyInputModel
  let loginResults: ILoginResult[] = []
  let questions: IInsertQuestionOutputModel[]

  describe(`SA`, () => {

    it(`+ create user_0`, async () => {
      inputDataUser_0 = {
        login: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password()
      }
      const response = await request(server)
        .post(endpoints.saController.postUser())
        .auth(superUser.login, superUser.password, { type: "basic" })
        .send(inputDataUser_0)

      expect(response.body.login).toEqual(inputDataUser_0.login)
      expect(response.body.email).toEqual(inputDataUser_0.email)

      expect(response.status).toEqual(HttpStatus.CREATED)
    })

    it(`+ create user_1`, async () => {
      inputDataUser_1 = {
        login: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password()
      }
      const response = await request(server)
        .post(endpoints.saController.postUser())
        .auth(superUser.login, superUser.password, { type: "basic" })
        .send(inputDataUser_1)

      expect(response.body.login).toEqual(inputDataUser_1.login)
      expect(response.body.email).toEqual(inputDataUser_1.email)

      expect(response.status).toEqual(HttpStatus.CREATED)
    })

    it(`+ login`, async () => {
      const loginBodyInputModels: LoginBodyInputModel[] = []
      loginBodyInputModels.push(
        { loginOrEmail: inputDataUser_0.login, password: inputDataUser_0.password },
        { loginOrEmail: inputDataUser_1.login, password: inputDataUser_1.password }
      )

      const loginUserResults = await publicHelper.loginUsers(loginBodyInputModels)
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

      console.log("loginResults", loginResults)
    })

    it(`+ create questions`, async () => {

      const createResponses: any[] = []
      for (let i = 0; i < 5; i++) {
        const question = saHelper.createQuestion(2)

        const response = await request(server)
          .post(endpoints.saController.createQuestion())
          .auth(superUser.login, superUser.password, { type: "basic" })
          .send(question)
        createResponses.push({ status: response.status, body: response.body })
      }

      const isEquals = createResponses.every(resp => resp.status === HttpStatus.CREATED)
      expect(isEquals).toBeTruthy()
      questions = createResponses.map(resp => resp.body)

    })

    it(`+ publish questions`, async () => {

      const publishStatuses: number[] = []
      for (const question of questions) {
        const response = await request(server)
          .put(endpoints.saController.publishQuestion(question.id))
          .auth(superUser.login, superUser.password, { type: "basic" })
          .send({ published: true })
        publishStatuses.push(response.status)
      }

      const isEquals = publishStatuses.every(status => status === HttpStatus.NO_CONTENT)
      expect(isEquals).toBeTruthy()

    })

  })


  describe(`Public`, () => {

    it(`+ connection`, async () => {

      const response = await request(server)
        .post(endpoints.publicController.connection())
        .auth(loginResults[0].accessToken, { type: "bearer" })

      expect(response.status).toEqual(HttpStatus.CREATED)
      expect(response.body.id).toEqual(expect.any(String))
      expect(response.body.firstPlayerProgress.answers).toBeNull()
      expect(response.body.firstPlayerProgress.player.id).toEqual(expect.any(String))
      expect(response.body.firstPlayerProgress.player.login).toEqual(loginResults[0].login)
      expect(response.body.firstPlayerProgress.score).toEqual(0)
      expect(response.body.secondPlayerProgress.answers).toBeNull()
      expect(response.body.secondPlayerProgress.player).toBeNull()
      expect(response.body.secondPlayerProgress.score).toEqual(0)
      expect(response.body.questions).toEqual(expect.any(Array))
      expect(response.body.questions).toHaveLength(5)
      expect(response.body.status).toEqual(QuizStatusEnum.PendingSecondPlayer)
      expect(response.body.pairCreatedDate).toEqual(expect.any(String))
      expect(response.body.startGameDate).toBeNull()
      expect(response.body.finishGameDate).toBeNull()


    })


  })

})


