import { IsMongoId } from 'class-validator';

export class MongoIdParamDto {
  @IsMongoId({ message: 'Invalid user id' })
  id!: string;
}
