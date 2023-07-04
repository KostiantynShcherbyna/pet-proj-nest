import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Users, UsersModel } from "src/schemas/users.schema"

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(Users.name) protected UsersModel: UsersModel,
    ) { }

    async saveDocument(document: any) {
        await document.save()
    }

}
