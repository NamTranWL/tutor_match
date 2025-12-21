import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { MongoIdParamDto } from '@/modules/users/dto/mongo-id-param.dto';

@Controller('reviews')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param() { id }: MongoIdParamDto) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param() { id }: MongoIdParamDto, @Body() dto: UpdateReviewDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param() { id }: MongoIdParamDto) {
    return this.service.remove(id);
  }
}
