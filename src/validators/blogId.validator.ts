import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { BlogsRepository } from 'src/repositories/blogs.repository';

@ValidatorConstraint({ name: 'BlogIdIsExist', async: true })
@Injectable()
export class BlogIdIsExist implements ValidatorConstraintInterface {
  constructor(
    private readonly blogsRepository: BlogsRepository,
  ) {
  }

  async validate(blogId: string) {
    const foundBlog = await this.blogsRepository.findBlog(blogId)
    if (foundBlog === null) return false
    return true
  }
  defaultMessage(): string {
    return "Blog not found"
  }
}


// export function BlogIdIsExist(validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'BlogExists',
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       validator: BlogIdIsExistConstraint,
//     });
//   };
// }
