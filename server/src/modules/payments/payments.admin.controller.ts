import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MongoIdParamDto } from '@/modules/users/dto/mongo-id-param.dto';
import { AdminRole } from '@/decorator/roles.decorator';

@Controller('admin/payments')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PaymentsAdminController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @AdminRole()
  list(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Post()
  @AdminRole()
  create(@Req() req: Request, @Body() dto: CreatePaymentDto) {
    const user = req.user as any;
    return this.service.create(user.id, dto);
  }

  @Get(':id')
  @AdminRole()
  getOne(@Param() { id }: MongoIdParamDto) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @AdminRole()
  update(@Param() { id }: MongoIdParamDto, @Body() dto: UpdatePaymentDto) {
    return this.service.update(id, dto);
  }
}
