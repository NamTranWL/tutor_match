import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Req,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestBookingService } from './request-booking.service';
import { CreateRequestBookingsDto } from './dto/create-request-bookings.dto';
import { ParentRole, RolesAny, TutorRole } from '@/decorator/roles.decorator';
import { MongoIdParamDto } from '@/modules/users/dto/mongo-id-param.dto';

@Controller('request-bookings')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RequestBookingController {
  constructor(private readonly service: RequestBookingService) {}

  @Post()
  @RolesAny('parent', 'admin')
  createMany(@Req() req: Request, @Body() dto: CreateRequestBookingsDto) {
    const user = req.user as any;
    return this.service.createMany(user.id, dto);
  }

  @Get('my')
  @ParentRole()
  listMine(@Req() req: Request, @Query() query: any) {
    const user = req.user as any;
    return this.service.listForParent(user.id, query);
  }

  @Get('for-me')
  @TutorRole()
  listForTutor(@Req() req: Request, @Query() query: any) {
    const user = req.user as any;
    return this.service.listForTutor(user.id, query);
  }

  @Post(':id/cancel')
  @ParentRole()
  cancel(@Req() req: Request, @Param() { id }: MongoIdParamDto) {
    const user = req.user as any;
    return this.service.cancelByParent(user.id, id);
  }
}
