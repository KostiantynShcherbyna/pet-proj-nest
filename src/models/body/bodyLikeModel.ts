import { IsString } from 'class-validator';
import { myStatusEnum } from '../../utils/constants/constants';

export class BodyLikeModel {
  @IsString()
  likeStatus: myStatusEnum;
}
