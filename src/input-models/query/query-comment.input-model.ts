import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SORT_BY_DEFAULT, SortDirection } from 'src/utils/constants/constants';

export class QueryCommentInputModel {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = PAGE_NUMBER_DEFAULT

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = PAGE_SIZE_DEFAULT

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy: string = SORT_BY_DEFAULT

  @IsOptional()
  @IsEnum(SortDirection)
  @MaxLength(4)
  sortDirection: SortDirection = SortDirection.Desc
}
