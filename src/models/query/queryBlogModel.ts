import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { DefaultValuePipe } from "@nestjs/common";

export class QueryBlogModel {
  @IsString()
  @IsNotEmpty()
  searchNameTerm: string = "";

  @IsString()
  @IsNotEmpty()
  sortBy: string = "createdAt";

  @IsString()
  @IsNotEmpty()
  sortDirection: string = "-1";

  @IsNumber()
  @IsNotEmpty()
  pageNumber: number = 1;

  @IsNumber()
  @IsNotEmpty()
  pageSize: number = 10;
}
