import { CreateBlogBodyInputModel } from "../../../src/features/blogger/api/models/input/create-blog.body.input-model"
import request from "supertest"
import { endpoints } from "./routing.helper"
import { faker } from "@faker-js/faker"
import { CreatePostBodyInputModel } from "../../../src/features/blogger/api/models/input/create-post.body.input-model"
import { superUser } from "../../ht16/helpers/prepeared-data"
import {
  CreateUserOutputModel,
  UsersView
} from "../../../src/features/super-admin/api/models/output/create-user.output-model"

type CreateUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
};

type CreateAndLoginUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
};

export class SaTestingHelper {
  constructor(private readonly server: any) {
  }

  async createUsers(usersCount: number): Promise<{ status: number, body: CreateUserOutputModel }[]> {
    const usersDto: { status: number, body: CreateUserOutputModel }[] = []
    for (let i = 0; i < usersCount; i++) {
      const inputUserData = {
        login: `user${i}`,
        email: `user${i}@email.com`,
        password: `password${i}`,
      }
      const response = await request(this.server)
        .post(endpoints.saController.postUser())
        .auth(superUser.login, superUser.password, { type: "basic" })
        .send(inputUserData)

      usersDto.push({ status: response.status, body: response.body })
    }
    return usersDto
  }

  async getUsers(): Promise<{ status: number, body: UsersView }> {
    const response = await request(this.server)
      .get(endpoints.saController.getUsers())
      .auth(superUser.login, superUser.password, { type: "basic" })

    return { status: response.status, body: response.body }
  }

  async banUser(id: string): Promise<number> {
    const response = await request(this.server)
      .put(endpoints.saController.banUser(id))
      .auth(superUser.login, superUser.password, { type: "basic" })

    return response.status
  }

}