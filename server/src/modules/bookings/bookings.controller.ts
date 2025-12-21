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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { MongoIdParamDto } from '@/modules/users/dto/mongo-id-param.dto';

@Controller('bookings')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
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
  update(@Param() { id }: MongoIdParamDto, @Body() dto: UpdateBookingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param() { id }: MongoIdParamDto) {
    return this.service.remove(id);
  }
}
