import { EmailAdapter } from "../../adapters/email.adapter"
import { UsersDocument } from "../../../features/super-admin/application/entity/users.schema"

export class EmailAdapterMock implements EmailAdapter {
  async sendConfirmationCode(user: UsersDocument): Promise<any> {
    await Promise.resolve()
  }

  async sendPasswordRecovery(email: string, passwordRecoveryToken: string): Promise<any> {
    await Promise.resolve()
  }
}
