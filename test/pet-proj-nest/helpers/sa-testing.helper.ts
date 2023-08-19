import request from "supertest"
import { endpoints } from "./routing.helper"
import { faker } from "@faker-js/faker"
import {
  CreateUserOutputModel,
  UsersView
} from "../../../src/features/sa/api/models/output/create-user.output-model"

export const superUser = {
  login: "admin",
  password: "qwerty",
}

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
      .send({
        isBanned: true,
        banReason: faker.string.alpha(20),
      })

    return response.status
  }

  async unbanUser(id: string): Promise<number> {
    const response = await request(this.server)
      .put(endpoints.saController.banUser(id))
      .auth(superUser.login, superUser.password, { type: "basic" })
      .send({
        isBanned: false,
        banReason: faker.string.alpha(20),
      })

    return response.status
  }

  async deleteUser(id: string): Promise<number> {
    const response = await request(this.server)
      .delete(endpoints.saController.deleteUser(id))
      .auth(superUser.login, superUser.password, { type: "basic" })

    return response.status
  }

  async banBlog(id: string): Promise<number> {
    const response = await request(this.server)
      .put(endpoints.saController.banBlog(id))
      .auth(superUser.login, superUser.password, { type: "basic" })
      .send({
        isBanned: true
      })

    return response.status
  }

  async unbanBlog(id: string): Promise<number> {
    const response = await request(this.server)
      .put(endpoints.saController.banBlog(id))
      .auth(superUser.login, superUser.password, { type: "basic" })
      .send({
        isBanned: false
      })

    return response.status
  }

  async bindBlog(id: string, userId: string) {
    const response = await request(this.server)
      .put(endpoints.saController.bindBlog(id, userId))
      .auth(superUser.login, superUser.password, { type: "basic" })
    return { status: response.status, body: response.body }
  }

  async getBlogs() {
    const response = await request(this.server)
      .get(endpoints.saController.getBlogs())
      .auth(superUser.login, superUser.password, { type: "basic" })

    return { status: response.status, body: response.body }
  }

}