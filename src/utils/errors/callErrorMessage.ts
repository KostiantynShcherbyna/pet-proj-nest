import { BadRequestException } from "@nestjs/common/exceptions"

export const callErrorMessage = (message: any, field: string) => {
    return {
        message: message,
        field: field,
    }
}
