import { BadRequestException } from "@nestjs/common/exceptions"
import { ErrorsType } from "../errors/error-manager.type"

export const callErrorMessage = (message: string, field: string): ErrorsType => {
    return {
        message: message,
        field: field,
    }
}
