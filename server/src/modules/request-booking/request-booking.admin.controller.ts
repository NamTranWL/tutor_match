import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestBookingService } from './request-booking.service';
import { AdminRole } from '@/decorator/roles.decorator';
import { MongoIdParamDto } from '@/modules/users/dto/mongo-id-param.dto';
import { AcceptRequestBookingDto } from './dto/accept-request-booking.dto';
import { RejectRequestBookingDto } from './dto/reject-request-booking.dto';

@Controller('admin/request-bookings')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RequestBookingAdminController {
  constructor(private readonly service: RequestBookingService) {}

  @Get()
  @AdminRole()
  listAll(@Query() query: any) {
    return this.service.listForAdmin(query);
  }

  @Post(':id/accept')
  @AdminRole()
  accept(
    @Req() req: Request,
    @Param() { id }: MongoIdParamDto,
    @Body() body: AcceptRequestBookingDto,
  ) {
    const user = req.user as any;
    return this.service.acceptByAdmin(
      user.id,
      id,
      body.amount,
      body.bookingStatus,
    );
  }

  @Post(':id/reject')
  @AdminRole()
  reject(
    @Req() req: Request,
    @Param() { id }: MongoIdParamDto,
    @Body() body: RejectRequestBookingDto,
  ) {
    const user = req.user as any;
    return this.service.rejectByAdmin(user.id, id, body.reason);
  }
}
