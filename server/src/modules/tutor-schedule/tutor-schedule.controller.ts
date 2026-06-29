import {
  Body,
  Controller,
  Delete,
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
import { TutorScheduleService } from './tutor-schedule.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { Public } from '@/decorator/customize';
import { TutorRole } from '@/decorator/roles.decorator';
import { MongoIdParamDto } from '@/modules/users/dto/mongo-id-param.dto';

@Controller('tutor-schedule')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TutorScheduleController {
  constructor(private readonly service: TutorScheduleService) {}

  /**
   * Public — Parent views available slots for a specific tutor.
   * GET /tutor-schedule/public/:tutorProfileId?fromDate=2025-07-14&toDate=2025-07-20
   */
  @Public()
  @Get('public/:id')
  getPublic(
    @Param() { id }: MongoIdParamDto,
    @Query() query: { fromDate?: string; toDate?: string },
  ) {
    return this.service.getPublicSlots(id, query);
  }

  /**
   * Tutor — View own slots.
   * GET /tutor-schedule/my?fromDate=2025-07-14&toDate=2025-07-20&status=available
   */
  @TutorRole()
  @Get('my')
  listMine(
    @Req() req: Request,
    @Query() query: { fromDate?: string; toDate?: string; status?: string },
  ) {
    const user = req.user as any;
    return this.service.listMySlots(user.id, query);
  }

  /**
   * Tutor — Create a single slot manually.
   * POST /tutor-schedule
   */
  @TutorRole()
  @Post()
  create(@Req() req: Request, @Body() dto: CreateSlotDto) {
    const user = req.user as any;
    return this.service.createSlot(user.id, dto);
  }

  /**
   * Tutor — Generate slots from weeklyAvailability for a date range.
   * POST /tutor-schedule/generate
   * Body: { fromDate: "2025-07-14", toDate: "2025-07-20" }
   */
  @TutorRole()
  @Post('generate')
  generate(@Req() req: Request, @Body() dto: GenerateSlotsDto) {
    const user = req.user as any;
    return this.service.generateSlots(user.id, dto);
  }

  /**
   * Tutor — Update slot status/note (cannot modify booked slots).
   * PATCH /tutor-schedule/:id
   */
  @TutorRole()
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param() { id }: MongoIdParamDto,
    @Body() dto: UpdateSlotDto,
  ) {
    const user = req.user as any;
    return this.service.updateSlot(user.id, id, dto);
  }

  /**
   * Tutor — Delete a slot (cannot delete booked slots).
   * DELETE /tutor-schedule/:id
   */
  @TutorRole()
  @Delete(':id')
  remove(@Req() req: Request, @Param() { id }: MongoIdParamDto) {
    const user = req.user as any;
    return this.service.deleteSlot(user.id, id);
  }
}
