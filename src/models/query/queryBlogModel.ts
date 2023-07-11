import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { DefaultValuePipe } from "@nestjs/common"
import { SortDirection } from "../../utils/constants/constants"

export class QueryBlogModel {
  @IsOptional()
  @IsString()
  searchNameTerm: string = ""

  @IsOptional()
  @IsString()
  sortBy: string = "createdAt"

  @IsOptional()
  @IsString()
  sortDirection: string = SortDirection.desc

  @IsOptional()
  @IsInt()
  @Min(0)
  pageNumber: number = 1

  @IsOptional()
  @IsInt()
  @Min(0)
  pageSize: number = 10
}
