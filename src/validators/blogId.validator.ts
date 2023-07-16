import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
  } from 'class-validator';
import { BlogsRepository } from 'src/repositories/blogs.repository';
import { callErrorMessage } from 'src/utils/errors/callErrorMessage';
import { ErrorEnums } from 'src/utils/errors/errorEnums';

  
  @ValidatorConstraint({name: 'BlogExists', async: true })
  @Injectable()
  export class BlogIdIsExistConstraint implements ValidatorConstraintInterface {
    constructor(private readonly blogsRepository: BlogsRepository,) { }
  
    async validate(blogId: string) {
      try{
        const foundBlog = await this.blogsRepository.findBlog(blogId)
        return !!foundBlog
      }
      catch (e) {
          return false
      }
        
    }

    defaultMessage(validationArguments?: ValidationArguments ): string {
      return "Blog doesn't exist"
    }

  }

  export function BlogIdIsExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'BlogExists',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: BlogIdIsExistConstraint,
      });
    };
  }


// @ValidatorConstraint({ async: true })
// export class BlogIdValidator implements ValidatorConstraintInterface {
//     constructor(private readonly blogsRepository: BlogsRepository,) { }

//     async validate(blogId: string) {
//         const foundBlog = await this.blogsRepository.findBlog(blogId)
//         if (foundBlog === null) throw new NotFoundException(
//             callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
//         )
//         return true
//     }
// }


// export function BlogIdExistValidator(validationOptions?: ValidationOptions) {
//     return function (object: object, propertyName: string) {
//       registerDecorator({
//         target: object.constructor,
//         propertyName: propertyName,
//         options: validationOptions,
//         constraints: [],
//         validator: BlogIdValidator,
//       });
//     };
//   }




// @Injectable()
// export class BlogIdValidator {
//     constructor(
//         @Inject(BlogsRepository) protected BlogsRepository: BlogsRepository,
//         public value: string,
//     ) { this.value = value }

//     async findBlog(value) {
//         const foundBlog = await this.BlogsRepository.findBlog(value)
//         if (foundBlog === null) throw new NotFoundException(
//             callErrorMessage(ErrorEnums.BLOG_NOT_FOUND, "blogId")
//         )
//     }

// }