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
import { SaTestingHelper } from "./helpers/sa-testing.helper"
import { CreateUserOutputModel } from "../../src/features/sa/api/models/output/create-user.output-model"
import { UsersDocument } from "../../src/features/sa/application/entities/mongoose/users.schema"

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
    const saTestingHelper: SaTestingHelper = new SaTestingHelper(server)
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
      saTestingHelper,
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

  // describe
  // (`REGISTRATION and REGISTRATION-CONFIRMATION and LOGIN`, () => {
  //
  //   it
  //   (`+ Registration user`, async () => {
  //     const { publicTestingHelper }: { publicTestingHelper: PublicTestingHelper } = expect.getState() as any
  //     const registrationResultUser = await publicTestingHelper.registration()
  //     expect(registrationResultUser.status).toEqual(HttpStatus.NO_CONTENT)
  //
  //     expect.setState({ inputDataUser: { ...registrationResultUser.inputUserData } })
  //   })
  //
  //   it
  //   (`+ Registration-confirmation user`, async () => {
  //     const { inputDataUser, publicTestingHelper, testingRepository }: {
  //       inputDataUser: RegistrationBodyInputModel,
  //       publicTestingHelper: PublicTestingHelper,
  //       testingRepository: TestingRepository,
  //     } = expect.getState() as any
  //
  //     const user = await testingRepository.getUser({ loginOrEmail: inputDataUser.login })
  //     expect(user).not.toBeNull()
  //     expect(user?.emailConfirmation.confirmationCode).not.toBeNull()
  //
  //     const confirmationResultUser = await publicTestingHelper.registrationConfirmation(user!.emailConfirmation.confirmationCode!)
  //     expect(confirmationResultUser.status).toEqual(HttpStatus.NO_CONTENT)
  //   })
  //
  //   it
  //   (`+ Login user`, async () => {
  //     const { inputDataUser, publicTestingHelper, testingRepository }: {
  //       inputDataUser: RegistrationBodyInputModel,
  //       publicTestingHelper: PublicTestingHelper,
  //       testingRepository: TestingRepository,
  //     } = expect.getState() as any
  //
  //     const user = await testingRepository.getUser({ loginOrEmail: inputDataUser.login })
  //     expect(user).toBeDefined()
  //     expect(user?.emailConfirmation.confirmationCode).toBeDefined()
  //
  //     const loginResultUser = await publicTestingHelper.login({
  //       loginOrEmail: inputDataUser.login || inputDataUser.email,
  //       password: inputDataUser.password
  //     })
  //     expect(loginResultUser.status).toEqual(HttpStatus.OK)
  //     expect(loginResultUser.accessToken).toEqual(expect.any(String))
  //     expect(loginResultUser.refreshToken).toEqual(expect.any(String))
  //
  //     expect.setState({
  //       accessTokenUser0: loginResultUser.accessToken,
  //       refreshTokenUser: loginResultUser.refreshToken,
  //     })
  //   })
  //
  // })


  describe
  (`AUTH`, () => {

    it
    (`+ registration`, async () => {
      const { publicTestingHelper }: { publicTestingHelper: PublicTestingHelper } = expect.getState() as any

      const registrationResultUser0 = await publicTestingHelper.registration()
      expect(registrationResultUser0.status).toEqual(HttpStatus.NO_CONTENT)

      expect.setState({ inputDataUser0: { ...registrationResultUser0.inputUserData } })
    })

    it
    (`+ registration-email-resending`, async () => {
      const { inputDataUser0, publicTestingHelper, testingRepository }: {
        inputDataUser0: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user0 = await testingRepository.getUser({ loginOrEmail: inputDataUser0.email })
      expect(user0).not.toBeNull()
      expect(user0?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user0?.emailConfirmation.isConfirmed).toEqual(false)

      const resendingUser0 = await publicTestingHelper.registrationEmailResending(inputDataUser0.email)
      expect(resendingUser0.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ registration-confirmation`, async () => {
      const { inputDataUser0, publicTestingHelper, testingRepository }: {
        inputDataUser0: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user0 = await testingRepository.getUser({ loginOrEmail: inputDataUser0.login })
      expect(user0).not.toBeNull()
      expect(user0?.emailConfirmation.confirmationCode).not.toBeNull()
      expect(user0?.emailConfirmation.isConfirmed).toEqual(false)

      const confirmationResultUser0 = await publicTestingHelper.registrationConfirmation(user0!.emailConfirmation.confirmationCode!)
      expect(confirmationResultUser0.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ login`, async () => {
      const { inputDataUser0, publicTestingHelper, testingRepository }: {
        inputDataUser0: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
      } = expect.getState() as any

      const user0 = await testingRepository.getUser({ loginOrEmail: inputDataUser0.login })
      expect(user0).toBeDefined()
      expect(user0?.emailConfirmation.confirmationCode).toBeDefined()

      const loginResultUser0 = await publicTestingHelper.login({
        loginOrEmail: inputDataUser0.login || inputDataUser0.email,
        password: inputDataUser0.password
      })
      expect(loginResultUser0.status).toEqual(HttpStatus.OK)
      expect(loginResultUser0.accessToken).toEqual(expect.any(String))
      expect(loginResultUser0.refreshToken).toEqual(expect.any(String))

      expect.setState({
        accessTokenUser0: loginResultUser0.accessToken,
        refreshTokenUser0: loginResultUser0.refreshToken
      })
    })

    it
    (`+ refresh-token`, async () => {
      const { publicTestingHelper, refreshTokenUser0 }: {
        publicTestingHelper: PublicTestingHelper,
        refreshTokenUser0: string,
      } = expect.getState() as any

      const refreshTokenResultUser0 = await publicTestingHelper.refreshToken(refreshTokenUser0)
      expect(refreshTokenResultUser0.status).toEqual(HttpStatus.OK)
      expect(refreshTokenResultUser0.accessToken).toEqual(expect.any(String))
      expect(refreshTokenResultUser0.refreshToken).toEqual(expect.any(String))

      expect.setState({
        accessTokenUser01: refreshTokenResultUser0.accessToken,
        refreshTokenUser01: refreshTokenResultUser0.refreshToken,
      })
    })

    it
    (`+ password-recovery`, async () => {
      const { inputDataUser0, publicTestingHelper, testingRepository, authRepository }: {
        inputDataUser0: RegistrationBodyInputModel,
        publicTestingHelper: PublicTestingHelper,
        testingRepository: TestingRepository,
        authRepository: AuthRepository,
      } = expect.getState() as any

      const user0 = await testingRepository.getUser({ loginOrEmail: inputDataUser0.email })
      expect(user0).toBeDefined()

      const passwordRecoveryResultUser0 = await publicTestingHelper.passwordRecovery(user0!.accountData.email)
      expect(passwordRecoveryResultUser0.status).toEqual(HttpStatus.NO_CONTENT)

      const passwordRecoveryCodeUser0 = await authRepository.findRecoveryCode(user0!.accountData.email)
      expect.setState({ passwordRecoveryCodeUser0 })
    })

    it
    (`+ new-password`, async () => {
      const { publicTestingHelper, passwordRecoveryCodeUser0 }: {
        publicTestingHelper: PublicTestingHelper,
        passwordRecoveryCodeUser0: RecoveryCodesDocument,
      } = expect.getState() as any

      const newPasswordResultUser0 = await publicTestingHelper.newPassword({
        newPassword: faker.internet.password(),
        recoveryCode: passwordRecoveryCodeUser0.recoveryCode,
      })
      expect(newPasswordResultUser0.status).toEqual(HttpStatus.NO_CONTENT)
    })

    it
    (`+ me`, async () => {
      const { publicTestingHelper, accessTokenUser01 }: {
        publicTestingHelper: PublicTestingHelper,
        accessTokenUser01: string,
      } = expect.getState() as any

      const meResultUser0 = await publicTestingHelper.me(accessTokenUser01)
      expect(meResultUser0.status).toEqual(HttpStatus.OK)

      expect.setState({ user0OutputView: meResultUser0.body })
    })

    it
    (`+ logout`, async () => {
      const { publicTestingHelper, refreshTokenUser01 }: {
        publicTestingHelper: PublicTestingHelper,
        refreshTokenUser01: string,
      } = expect.getState() as any

      const logoutResultUser0 = await publicTestingHelper.logout(refreshTokenUser01)
      expect(logoutResultUser0.status).toEqual(HttpStatus.NO_CONTENT)
    })

  })

  describe
  (`BLOGGER`, () => {

    // it
    // ("+ Post blog", async () => {
    //   const { bloggerTestingHelper, accessTokenUser0 }: {
    //     bloggerTestingHelper: BloggerTestingHelper,
    //     accessTokenUser0: string,
    //   } = expect.getState() as any
    //
    //   const createBlogByUser0Result = await bloggerTestingHelper.createBlog(accessTokenUser0)
    //   expect(createBlogByUser0Result.status).toEqual(HttpStatus.CREATED)
    //   expect(createBlogByUser0Result.body).toEqual({
    //     ...createBlogByUser0Result.inputBlogData,
    //     id: expect.any(String),
    //     createdAt: expect.any(String),
    //     isMembership: expect.any(Boolean),
    //   })
    //
    //   expect.setState({ blogOfUser: createBlogByUser0Result.body })
    // })

    it
    ("+ Create blog or blogs", async () => {
      const { bloggerTestingHelper, accessTokenUser0 }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser0: string,
      } = expect.getState() as any

      const createBlogByUser0Result = await bloggerTestingHelper.createBlogs(accessTokenUser0, 4)

      const blogsOfUser0: CreateBloggerBlogOutputModel[] = []
      for (let i = 0; i < createBlogByUser0Result.length; i++) {
        expect(createBlogByUser0Result[i].status).toEqual(HttpStatus.CREATED)
        expect(createBlogByUser0Result[i].body).toEqual(
          {
            ...createBlogByUser0Result[i].inputBlogData,
            id: expect.any(String),
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          }
        )
        blogsOfUser0.push(createBlogByUser0Result[i].body)
      }
      expect.setState({ blogsOfUser0 })
    })

    it
    ("+ Get blogs", async () => {
      const { bloggerTestingHelper, accessTokenUser0, blogsOfUser0 }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser0: string,
        blogsOfUser0: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any

      const getBlogsOfUser0Result = await bloggerTestingHelper.getBlogs(accessTokenUser0)
      expect(getBlogsOfUser0Result.status).toEqual(HttpStatus.OK)
      expect(getBlogsOfUser0Result.body.page).toBe(1)
      expect(getBlogsOfUser0Result.body.pageSize).toBe(10)
      expect(getBlogsOfUser0Result.body.pagesCount).toBe(1)
      expect(getBlogsOfUser0Result.body.totalCount).toBe(blogsOfUser0.length)
      expect(getBlogsOfUser0Result.body.items).toHaveLength(blogsOfUser0.length)
      expect(getBlogsOfUser0Result.body.items).toEqual(blogsOfUser0.reverse())
    })

    it
    ("+ Create post or posts", async () => {
      const { bloggerTestingHelper, accessTokenUser0, blogsOfUser0 }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser0: string,
        blogsOfUser0: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any

      const blogsId = blogsOfUser0.map(blogOfUser => blogOfUser.id)
      const createPostsOfBlogResult = await bloggerTestingHelper.createPostsOfBlog(accessTokenUser0, blogsId, 1)

      const postsOfBlog: CreateBloggerPostOutputModel[] = []
      for (let i = 0; i < createPostsOfBlogResult.length; i++) {
        expect(createPostsOfBlogResult[i].status).toEqual(HttpStatus.CREATED)
        expect(createPostsOfBlogResult[i].body).toEqual(
          {
            ...createPostsOfBlogResult[i].inputPostData,

            id: expect.any(String),
            blogId: blogsOfUser0[i].id,
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
      const { bloggerTestingHelper, accessTokenUser0, blogsOfUser0 }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser0: string,
        blogsOfUser0: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any

      const updateBlogStatusResult = await bloggerTestingHelper.updateBlog(accessTokenUser0, blogsOfUser0[0].id)
      expect(updateBlogStatusResult).toEqual(HttpStatus.NO_CONTENT)

      // const blogsResult = await bloggerTestingHelper.getBlogs(accessTokenUser0)
      // expect(blogsResult.status).toEqual(HttpStatus.NO_CONTENT)
      // expect(blogsResult.body).toEqual({
      //
      // })

    })

    it
    ("+ Update post", async () => {
      const { bloggerTestingHelper, accessTokenUser0, blogsOfUser0, postsOfBlog }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser0: string,
        blogsOfUser0: CreateBloggerBlogOutputModel[]
        postsOfBlog: CreateBloggerPostOutputModel[],
      } = expect.getState() as any

      const updatePostStatusResult = await bloggerTestingHelper.updatePost(accessTokenUser0, postsOfBlog[0].blogId, postsOfBlog[0].id)
      expect(updatePostStatusResult).toEqual(HttpStatus.NO_CONTENT)

    })

    it
    ("+ Get posts", async () => {
      const { bloggerTestingHelper, accessTokenUser0, blogsOfUser0, postsOfBlog }: {
        bloggerTestingHelper: BloggerTestingHelper
        accessTokenUser0: string
        blogsOfUser0: CreateBloggerBlogOutputModel[]
        postsOfBlog: CreateBloggerPostOutputModel[]
      } = expect.getState() as any

      const getPostsResult = await bloggerTestingHelper.getPosts(accessTokenUser0, blogsOfUser0[0].id)

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
    ("+ Create comment or comments", async () => {
      const { publicTestingHelper, accessTokenUser0, postsOfBlog }: {
        publicTestingHelper: PublicTestingHelper,
        accessTokenUser0: string,
        postsOfBlog: CreateBloggerPostOutputModel[],
      } = expect.getState() as any

      const postsId = postsOfBlog.map(postOfBlog => postOfBlog.id)
      const commentsDtoResult = await publicTestingHelper.createComments(accessTokenUser0, postsId, 2)

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
      const { bloggerTestingHelper, accessTokenUser0, allCommentsCount }: {
        bloggerTestingHelper: BloggerTestingHelper
        accessTokenUser0: string
        blogsOfUser0: CreateBloggerBlogOutputModel[]
        allCommentsCount: number
      } = expect.getState() as any

      const getBlogsCommentsResult = await bloggerTestingHelper.getBlogsComments(accessTokenUser0)

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

    it
    ("+ Delete post", async () => {
      const { bloggerTestingHelper, accessTokenUser0, postsOfBlog }: {
        bloggerTestingHelper: BloggerTestingHelper,
        accessTokenUser0: string,
        postsOfBlog: CreateBloggerPostOutputModel[],
      } = expect.getState() as any

      const deleteStatusResult = await bloggerTestingHelper.deletePost(accessTokenUser0, postsOfBlog[0].blogId, postsOfBlog[0].id)
      expect(deleteStatusResult).toBe(HttpStatus.NO_CONTENT)

      const getPostsResult = await bloggerTestingHelper.getPosts(accessTokenUser0, postsOfBlog[0].blogId)
      expect(getPostsResult.status).toBe(HttpStatus.OK)
      expect(getPostsResult.body.page).toBe(1)
      expect(getPostsResult.body.pageSize).toBe(10)
      expect(getPostsResult.body.pagesCount).toBe(postsOfBlog.length - 1)
      expect(getPostsResult.body.totalCount).toBe(postsOfBlog.length - 1)
      expect(getPostsResult.body.items).toHaveLength(postsOfBlog.length - 1)
    })

    it
    ("+ Ban user", async () => {
      const { bloggerTestingHelper, accessTokenUser0, postsOfBlog, user0OutputView }: {
        bloggerTestingHelper: BloggerTestingHelper
        accessTokenUser0: string
        postsOfBlog: CreateBloggerPostOutputModel[]
        user0OutputView: MeOutputModel
      } = expect.getState() as any

      const banStatusResult = await bloggerTestingHelper.banUser(accessTokenUser0, user0OutputView.userId, postsOfBlog[0].blogId)
      expect(banStatusResult).toBe(HttpStatus.NO_CONTENT)
    })

    it
    ("+ Get all banned users of blog", async () => {
      const { bloggerTestingHelper, accessTokenUser0, postsOfBlog, user0OutputView }: {
        bloggerTestingHelper: BloggerTestingHelper
        accessTokenUser0: string
        postsOfBlog: CreateBloggerPostOutputModel[]
        user0OutputView: MeOutputModel
      } = expect.getState() as any

      const getBannedUsersOfBlogResult = await bloggerTestingHelper.getBannedUsersOfBlog(accessTokenUser0, postsOfBlog[0].blogId)
      expect(getBannedUsersOfBlogResult.status).toBe(HttpStatus.OK)
      expect(getBannedUsersOfBlogResult.body.page).toBe(1)
      expect(getBannedUsersOfBlogResult.body.pageSize).toBe(10)
      expect(getBannedUsersOfBlogResult.body.pagesCount).toBe(1)
      expect(getBannedUsersOfBlogResult.body.totalCount).toBe(1)
      expect(getBannedUsersOfBlogResult.body.items).toHaveLength(1)
      expect(getBannedUsersOfBlogResult.body.items[0].id).toEqual(user0OutputView.userId)
    })

  })

  describe(`SUPER ADMIN`, () => {

    it("+ Create SAUser or SAUsers ", async () => {
      const { saTestingHelper }: { saTestingHelper: SaTestingHelper } = expect.getState() as any

      const createSaUsersResult = await saTestingHelper.createUsers(4)

      const saUserViews: CreateUserOutputModel[] = []
      expect(createSaUsersResult).toHaveLength(4)
      createSaUsersResult.forEach(saUserResult => {
        expect(saUserResult.status).toEqual(HttpStatus.CREATED)
        expect(saUserResult.body.id).toBeDefined()
        expect(saUserResult.body.login).toBeDefined()
        expect(saUserResult.body.email).toBeDefined()
        expect(saUserResult.body.createdAt).toBeDefined()
        expect(saUserResult.body.banInfo.isBanned).toBeDefined()
        expect(saUserResult.body.banInfo.banDate).toBeDefined()
        expect(saUserResult.body.banInfo.banReason).toBeDefined()
        saUserViews.push(saUserResult.body)
      })

      expect.setState({ saUserViews: saUserViews })
    })

    it("+ Get all users ", async () => {
      const { saTestingHelper, testingRepository, saUserViews, inputDataUser0 }: {
        saTestingHelper: SaTestingHelper
        testingRepository: TestingRepository,
        saUserViews: CreateUserOutputModel[]
        inputDataUser0: RegistrationBodyInputModel,
      } = expect.getState() as any

      const getUsersResult = await saTestingHelper.getUsers()
      const user0 = await testingRepository.getUser({ loginOrEmail: inputDataUser0.email })
      const user0View = {
        id: user0?.id,
        login: user0?.accountData.login,
        email: user0?.accountData.email,
        createdAt: user0?.accountData.createdAt,
        banInfo: {
          isBanned: user0?.accountData.banInfo.isBanned,
          banDate: user0?.accountData.banInfo.banDate,
          banReason: user0?.accountData.banInfo.banReason,
        }
      }

      const usersView = []

      expect(user0).toBeDefined()
      expect(getUsersResult.status).toBe(HttpStatus.OK)
      expect(getUsersResult.body.page).toBe(1)
      expect(getUsersResult.body.pageSize).toBe(10)
      expect(getUsersResult.body.pagesCount).toBe(1)
      expect(getUsersResult.body.totalCount).toBe(saUserViews.length + 1)
      expect(getUsersResult.body.items).toHaveLength(saUserViews.length + 1)
      expect(getUsersResult.body.items).toEqual([...saUserViews.reverse(), user0View])
    })

    it("+ Ban user ", async () => {
      const { saTestingHelper, saUserViews }: {
        saTestingHelper: SaTestingHelper
        saUserViews: CreateUserOutputModel[]
      } = expect.getState() as any

      const banUserStatusResult = await saTestingHelper.banUser(saUserViews[1].id)
      expect(banUserStatusResult).toBe(HttpStatus.NO_CONTENT)

      const getUsersResult = await saTestingHelper.getUsers()
      const bannedUser = getUsersResult.body.items.find(user => user.id === saUserViews[1].id)
      expect(bannedUser?.banInfo.isBanned).toEqual(true)
      expect(bannedUser?.banInfo.banDate).toBeDefined()
      expect(bannedUser?.banInfo.banReason).toBeDefined()
    })


    it("+ Delete user ", async () => {
      const { saTestingHelper, saUserViews }: {
        saTestingHelper: SaTestingHelper
        saUserViews: CreateUserOutputModel[]
      } = expect.getState() as any

      const deleteUserStatusResult = await saTestingHelper.deleteUser(saUserViews[2].id)
      expect(deleteUserStatusResult).toBe(HttpStatus.NO_CONTENT)

      const getUsersResult = await saTestingHelper.getUsers()
      const deletedUser = getUsersResult.body.items.find(user => user.id === saUserViews[2].id)
      expect(deletedUser).not.toBeDefined()
    })

    it("+ Ban blog ", async () => {
      const { saTestingHelper, saUserViews, blogsOfUser0, accessTokenUser0, publicTestingHelper }: {
        saTestingHelper: SaTestingHelper
        saUserViews: CreateUserOutputModel[]
        blogsOfUser0: CreateBloggerBlogOutputModel[]
        accessTokenUser0: string,
        publicTestingHelper: PublicTestingHelper
      } = expect.getState() as any


      const banBlogStatusResult = await saTestingHelper.banBlog(blogsOfUser0[2].id)
      expect(banBlogStatusResult).toBe(HttpStatus.NO_CONTENT)

      const getUsersResult = await saTestingHelper.getUsers()
      const deletedUser = getUsersResult.body.items.find(user => user.id === saUserViews[2].id)
      expect(deletedUser).not.toBeDefined()

      const getBlogResult = await publicTestingHelper.getBlog(accessTokenUser0, blogsOfUser0[2].id)
      expect(getBlogResult.status).toEqual(HttpStatus.NOT_FOUND)

    })

    it("+ Bind blog ", async () => {
      const { saTestingHelper, saUserViews, blogsOfUser0 }: {
        saTestingHelper: SaTestingHelper
        saUserViews: CreateUserOutputModel[]
        blogsOfUser0: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any


      const bindBlogStatusResult = await saTestingHelper.bindBlog(blogsOfUser0[3].id, saUserViews[3].id)
      expect(bindBlogStatusResult.status).toEqual(HttpStatus.BAD_REQUEST)
      expect(bindBlogStatusResult.body).toEqual({
        errorsMessages: [{
          message: "Blog already bound",
          field: "id"
        }]
      })

      // const getUsersResult = await saTestingHelper.getUsers()
      // const deletedUser = getUsersResult.body.items.find(user => user.id === saUserViews[2].id)
      // expect(deletedUser).not.toBeDefined()
      //
      // const getBlogResult = await publicTestingHelper.getBlog(accessTokenUser0, blogsOfUser0[2].id)
      // expect(getBlogResult.status).toEqual(HttpStatus.NOT_FOUND)

    })

    it
    ("+ Get blogs SA", async () => {
      const { saTestingHelper, blogsOfUser0 }: {
        saTestingHelper: SaTestingHelper
        blogsOfUser0: CreateBloggerBlogOutputModel[]
      } = expect.getState() as any

      console.log("blogsOfUser0", blogsOfUser0)


      const getBlogsOfUser0Result = await saTestingHelper.getBlogs()
      expect(getBlogsOfUser0Result.status).toEqual(HttpStatus.OK)
      expect(getBlogsOfUser0Result.body.page).toBe(1)
      expect(getBlogsOfUser0Result.body.pageSize).toBe(10)
      expect(getBlogsOfUser0Result.body.pagesCount).toBe(1)
      expect(getBlogsOfUser0Result.body.totalCount).toBe(blogsOfUser0.length)
      expect(getBlogsOfUser0Result.body.items).toHaveLength(blogsOfUser0.length)

    })

    // "blogOwnerInfo": {
    //   "userId": "string",
    //     "userLogin": "string"
    // },
    // "banInfo": {
    //   "isBanned": true,
    //     "banDate": "2023-08-10T13:01:46.879Z"
    // }
  })

})


