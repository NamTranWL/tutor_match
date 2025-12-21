import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  parentId: string;

  @IsNotEmpty()
  @IsString()
  tutorId: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsString()
  comment?: string;
}
