import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common"
import { ObjectId } from "mongodb"

@Injectable()
export default class ParseObjectIdPipe implements PipeTransform<any, ObjectId> {
  public transform(value: string): ObjectId {
    try {
      return ObjectId.createFromHexString(value);
    } catch (error) {
      throw new BadRequestException('Validation failed (ObjectId is expected)');
    }
  }
}

// @Injectable()
// export default class ValidateObjectIdPipe {
//   public validate(value) {
//     try {
//       ObjectId.createFromHexString(value)
//       return true
//     } catch (err) {
//       throw new BadRequestException('Validation failed (ObjectId is expected)');
//     }
//   }
// }
