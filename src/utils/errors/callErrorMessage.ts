import { BadRequestException } from "@nestjs/common/exceptions"

export const callErrorMessage = (message: string, field: string) => {
    return {
        message: message,
        field: field,
    }
}
