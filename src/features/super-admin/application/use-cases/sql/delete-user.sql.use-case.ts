import { CommandHandler } from "@nestjs/cqrs"
import { InjectModel } from "@nestjs/mongoose/dist/common"
import { Users, UsersModel } from "../../entities/mongoose/users.schema"
import { UsersRepository } from "../../../../../repositories/users/mongoose/users.repository"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersSqlRepository } from "../../../../../repositories/users/sql/users.sql.repository"


export class DeleteUserSqlCommand {
  constructor(
    public id: string
  ) {
  }
}

@CommandHandler(DeleteUserSqlCommand)
export class DeleteUserSql {
  constructor(
    @InjectModel(Users.name) protected UsersModel: UsersModel,
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }

  async execute(command: DeleteUserSqlCommand): Promise<Contract<null | boolean>> {

    // const deleteUserResult = await this.UsersModel.deleteOne({ _id: new Types.ObjectId(command.id) })


    const deleteResult = await this.usersSqlRepository.deleteUser(command.id)
    if (!deleteResult)
      return new Contract(null, ErrorEnums.USER_NOT_DELETED)

    return new Contract(true, null)
  }

}