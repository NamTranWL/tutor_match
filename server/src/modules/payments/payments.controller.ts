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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MongoIdParamDto } from '@/modules/users/dto/mongo-id-param.dto';

@Controller('payments')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
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
  update(@Param() { id }: MongoIdParamDto, @Body() dto: UpdatePaymentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param() { id }: MongoIdParamDto) {
    return this.service.remove(id);
  }
}
