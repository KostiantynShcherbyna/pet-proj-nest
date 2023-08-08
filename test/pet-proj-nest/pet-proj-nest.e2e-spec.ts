import { HttpStatus, INestApplication } from "@nestjs/common"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../src/app.module"
import { appSettings } from "../../src/app.settings"
import { PublicTestingHelper } from "./helpers/public-testing.helper"
import { TestingRepository } from "../../src/infrastructure/testing/infrastructure/testing.repository"
import { RegistrationBodyInputModel } from "../../src/features/auth/api/models/input/registration.body.input-model"
import { AuthRepository } from "../../src/features/auth/infrastructure/auth.repository"
import { faker } from "@faker-js/faker"
import { RecoveryCodesDocument } from "../../src/features/auth/application/entitys/recovery-code.schema"
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
    })
      .overrideProvider(EmailAdapter)
      .useClass(EmailAdapterMock)
      .compile()

    let app = await moduleFixture.createNestApplication()
    app = appSettings(app)
    await app.init()
    const server = app.getHttpServer()

    const publicTestingHelper: PublicTestingHelper = new PublicTestingHelper(server)
    const bloggerTestingHelper: BloggerTestingHelper = new BloggerTestingHelper(server)
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
      publicTestingHelper,
      authRepository,
      bloggerTestingHelper,
    })
    await request(server).delete(`/testing/all-data`)
  })

  afterAll
  (async () => {

    const { mongoMemoryServer, app, server }: {
      mongoMemoryServer: MongoMemoryServer,
      app: INestApplication,
      server
    } = expect.getState() as any
    await request(server).delete(`/testing/all-data`)
    await app.close()
    await mongoMemoryServer.stop()
  })

  describe
  (`REGISTRATION and REGISTRATION-CONFIRMATION and LOGIN`, () => {

    it
    (`+ Registration user`, async () => {
      const { publicTestingHelper }: { publicTestingHelper: PublicTestingHelper } = expect.getState() as any
      const registrationResultUser = await publicTestingHelper.registration()
      expect(registrationResultUser.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser: { ...registrationResultUser.inputUserData } })
    })

    it
    (`+ Registration-confirmation user`, async () => {
      const { inputDataUser, publicTestingHelper, testingRepository }: {
        inputDataUser: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user = await testingRepository.getUser({ loginOrEmail: inputDataUser.login })
      expect(user).not.toBeNull()
      expect(user?.emailConfirmation.confirmationCode).not.toBeNull()

      const confirmationResultUser = await publicTestingHelper.registrationConfirmation(user!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ Login user`, async () => {
      const { inputDataUser, publicTestingHelper, testingRepository }: {
        inputDataUser: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user = await testingRepository.getUser({ loginOrEmail: inputDataUser.login })
      expect(user).toBeDefined()
      expect(user?.emailConfirmation.confirmationCode).toBeDefined()

      const loginResultUser = await publicTestingHelper.login({
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
      const { publicTestingHelper }: { publicTestingHelper: PublicTestingHelper } = expect.getState() as any

      const registrationResultUser1 = await publicTestingHelper.registration()
      expect(registrationResultUser1.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser1: { ...registrationResultUser1.inputUserData } })
    })

    it
    (`+ registration-email-resending`, async () => {
      const { inputDataUser1, publicTestingHelper, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.email })
      expect(user1).not.toBeNull()
      expect(user1?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user1?.emailConfirmation.isConfirmed).toEqual(false)

      const resendingUser1 = await publicTestingHelper.registrationEmailResending(inputDataUser1.email)
      expect(resendingUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ registration-confirmation`, async () => {
      const { inputDataUser1, publicTestingHelper, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.login })
      expect(user1).not.toBeNull()
      expect(user1?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user1?.emailConfirmation.isConfirmed).toEqual(false)

      const confirmationResultUser1 = await publicTestingHelper.registrationConfirmation(user1!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ login`, async () => {
      const { inputDataUser1, publicTestingHelper, testingRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.login })
      expect(user1).toBeDefined()
      expect(user1?.emailConfirmation.confirmationCode).toBeDefined()

      const loginResultUser1 = await publicTestingHelper.login({
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
      const { publicTestingHelper, refreshTokenUser1 }: {
        publicTestingHelper: PublicTestingHelper,
        refreshTokenUser1: string,
      } = expect.getState() as any

      const refreshTokenResultUser1 = await publicTestingHelper.refreshToken(refreshTokenUser1)
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
      const { inputDataUser1, publicTestingHelper, testingRepository, authRepository }: {
        inputDataUser1: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
        authRepository: AuthRepository,
      } = expect.getState() as any

      const user1 = await testingRepository.getUser({ loginOrEmail: inputDataUser1.email })
      expect(user1).toBeDefined()

      const passwordRecoveryResultUser1 = await publicTestingHelper.passwordRecovery(user1!.accountData.email)
      expect(passwordRecoveryResultUser1.status).toEqual(HttpStatus.NO_CONTENT)

      const passwordRecoveryCodeUser1 = await authRepository.findRecoveryCode(user1!.accountData.email)
      expect.setState({ passwordRecoveryCodeUser1 })
    })

    it
    (`+ new-password`, async () => {
      const { publicTestingHelper, passwordRecoveryCodeUser1 }: {
        publicTestingHelper: PublicTestingHelper,
        passwordRecoveryCodeUser1: RecoveryCodesDocument,
      } = expect.getState() as any

      const newPasswordResultUser1 = await publicTestingHelper.newPassword({
        newPassword: faker.internet.password(),
        recoveryCode: passwordRecoveryCodeUser1.recoveryCode,
      })
      expect(newPasswordResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ me`, async () => {
      const { publicTestingHelper, accessTokenUser1_1 }: {
        publicTestingHelper: PublicTestingHelper,
        accessTokenUser1_1: string,
      } = expect.getState() as any

      const meResultUser1 = await publicTestingHelper.me(accessTokenUser1_1)
      expect(meResultUser1.status).toEqual(HttpStatus.OK)
    })

    it
    (`+ logout`, async () => {
      const { publicTestingHelper, refreshTokenUser1_1 }: {
        publicTestingHelper: PublicTestingHelper,
        refreshTokenUser1_1: string,
      } = expect.getState() as any

      const logoutResultUser1 = await publicTestingHelper.logout(refreshTokenUser1_1)
      expect(logoutResultUser1.status).toEqual(HttpStatus.NO_CONTENT)
    })

  })

  describe
  (`BLOGGER`, () => {

    // it
    // ("+ Post blog", async () => {
    //   const { bloggerTestingHelper, accessTokenUser }: {
    //     bloggerTestingHelper: BloggerTestingHelper,
    //     accessTokenUser: string,
    //   } = expect.getState() as any
    //
    //   const createBlogByUserResult = await bloggerTestingHelper.createBlog(accessTokenUser)
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
      const { bloggerTestingHelper, accessTokenUser }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser: string,
      } = expect.getState() as any

      const createBlogByUserResult = await bloggerTestingHelper.createBlogs(accessTokenUser, 1)

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
      expect.setState({ blogsOfUser })
    })

    it
    ("+ Get blogs", async () => {
      const { bloggerTestingHelper, accessTokenUser, blogsOfUser }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser: string,
        blogsOfUser: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any

      const getBlogsOfUserResult = await bloggerTestingHelper.getBlogs(accessTokenUser)
      expect(getBlogsOfUserResult.status).toEqual(HttpStatus.OK)
      expect(getBlogsOfUserResult.body.page).toBe(1)
      expect(getBlogsOfUserResult.body.pageSize).toBe(10)
      expect(getBlogsOfUserResult.body.pagesCount).toBe(1)
      expect(getBlogsOfUserResult.body.totalCount).toBe(blogsOfUser.length)
      expect(getBlogsOfUserResult.body.items).toHaveLength(blogsOfUser.length)
      expect(getBlogsOfUserResult.body.items).toEqual(blogsOfUser)
    })

    it
    ("+ Post post or posts", async () => {
      const { bloggerTestingHelper, accessTokenUser, blogsOfUser }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser: string,
        blogsOfUser: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any

      const blogsId = blogsOfUser.map(blogOfUser => blogOfUser.id)
      const createPostsOfBlogResult = await bloggerTestingHelper.createPostsOfBlog(accessTokenUser, blogsId, 1)

      const postsOfBlog: CreateBloggerPostOutputModel[] = []
      for (let i = 0; i < createPostsOfBlogResult.length; i++) {
        expect(createPostsOfBlogResult[i].status).toEqual(HttpStatus.CREATED)
        expect(createPostsOfBlogResult[i].body).toEqual(
          {
            ...createPostsOfBlogResult[i].inputPostData,

            id: expect.any(String),
            blogId: blogsOfUser[i].id,
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: LikeStatus.None,
              newestLikes: []
            }
          }
        )
        postsOfBlog.push(createPostsOfBlogResult[i].body)
      }
      expect.setState({ postsOfBlog })
    })

    it
    ("+ Update blog", async () => {
      const { bloggerTestingHelper, accessTokenUser, blogsOfUser }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser: string,
        blogsOfUser: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any

      const blogsId = blogsOfUser.map(blogOfUser => blogOfUser.id)
      const updateBlogStatusResult = await bloggerTestingHelper.updateBlog(accessTokenUser, blogsId[0])
      expect(updateBlogStatusResult).toEqual(HttpStatus.NO_CONTENT)

      // const blogsResult = await bloggerTestingHelper.getBlogs(accessTokenUser)
      // expect(blogsResult.status).toEqual(HttpStatus.NO_CONTENT)
      // expect(blogsResult.body).toEqual({
      //
      // })

    })

    it
    ("+ Update post", async () => {
      const { bloggerTestingHelper, accessTokenUser, blogsOfUser, postsOfBlog }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser: string,
        blogsOfUser: CreateBloggerBlogOutputModel[]
        postsOfBlog: CreateBloggerPostOutputModel[],
      } = expect.getState() as any

      const blogsId = blogsOfUser.map(blogOfUser => blogOfUser.id)
      const postsId = postsOfBlog.map(postOfBlog => postOfBlog.id)
      const updatePostStatusResult = await bloggerTestingHelper.updatePost(accessTokenUser, blogsId[0], postsId[0])
      expect(updatePostStatusResult).toEqual(HttpStatus.NO_CONTENT)

    })

    it
    ("+ Get posts", async () => {
      const { bloggerTestingHelper, accessTokenUser, blogsOfUser, postsOfBlog }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser: string,
        blogsOfUser: CreateBloggerBlogOutputModel[]
        postsOfBlog: CreateBloggerPostOutputModel[],
      } = expect.getState() as any

      const blogsId = blogsOfUser.map(blogOfUser => blogOfUser.id)
      const getPostsResult = await bloggerTestingHelper.getPosts(accessTokenUser, blogsId[0])

      expect(getPostsResult.status).toBe(HttpStatus.OK)
      expect(getPostsResult.body.page).toBe(1)
      expect(getPostsResult.body.pageSize).toBe(10)
      expect(getPostsResult.body.pagesCount).toBe(1)
      expect(getPostsResult.body.totalCount).toBe(postsOfBlog.length)
      expect(getPostsResult.body.items).toHaveLength(postsOfBlog.length)
      expect(getPostsResult.body.items[0]).toEqual({
        ...postsOfBlog[0],
        content: "updatedContent",
        shortDescription: "updatedShortDescription",
        title: "updatedTitle",
      })
    })

    it
    ("+ Post comment or comments", async () => {
      const { publicTestingHelper, accessTokenUser, postsOfBlog }: {
        publicTestingHelper: PublicTestingHelper,
        accessTokenUser: string,
        postsOfBlog: CreateBloggerPostOutputModel[],
      } = expect.getState() as any

      const postsId = postsOfBlog.map(postOfBlog => postOfBlog.id)
      const commentsDtoResult = await publicTestingHelper.createComments(accessTokenUser, postsId, 2)

      commentsDtoResult.forEach(commentDto => {
        expect(commentDto.status).toBe(HttpStatus.CREATED)
        expect(commentDto.body.id).toBeDefined()
        expect(commentDto.body.content).toBeDefined()
        expect(commentDto.body.commentatorInfo.userId).toBeDefined()
        expect(commentDto.body.commentatorInfo.userLogin).toBeDefined()
        expect(commentDto.body.createdAt).toBeDefined()
        expect(commentDto.body.likesInfo.likesCount).toBeDefined()
        expect(commentDto.body.likesInfo.dislikesCount).toBeDefined()
        expect(commentDto.body.likesInfo.myStatus).toBeDefined()
      })

      expect.setState({ allCommentsCount: commentsDtoResult.length })
    })

    it
    ("+ Get blogs comments", async () => {
      const { bloggerTestingHelper, accessTokenUser, postsOfBlog, allCommentsCount }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser: string,
        blogsOfUser: CreateBloggerBlogOutputModel[]
        postsOfBlog: CreateBloggerPostOutputModel[],
        allCommentsCount: number
      } = expect.getState() as any

      const getBlogsCommentsResult = await bloggerTestingHelper.getBlogsComments(accessTokenUser)

      const pagesCount = Math.ceil(allCommentsCount / 10)

      expect(getBlogsCommentsResult.status).toBe(HttpStatus.OK)
      expect(getBlogsCommentsResult.body.page).toBe(1)
      expect(getBlogsCommentsResult.body.pageSize).toBe(10)
      expect(getBlogsCommentsResult.body.pagesCount).toBe(pagesCount)
      expect(getBlogsCommentsResult.body.totalCount).toBe(allCommentsCount)
      expect(getBlogsCommentsResult.body.items).toHaveLength(allCommentsCount)
      getBlogsCommentsResult.body.items.forEach(item => {
        expect(item.id).toBeDefined()
        expect(item.content).toBeDefined()
        expect(item.commentatorInfo.userId).toBeDefined()
        expect(item.commentatorInfo.userLogin).toBeDefined()
        expect(item.createdAt).toBeDefined()
        expect(item.likesInfo.likesCount).toBeDefined()
        expect(item.likesInfo.dislikesCount).toBeDefined()
        expect(item.likesInfo.myStatus).toBeDefined()
        expect(item.postInfo.id).toBeDefined()
        expect(item.postInfo.title).toBeDefined()
        expect(item.postInfo.blogId).toBeDefined()
        expect(item.postInfo.blogName).toBeDefined()
      })

    })

  })

})

