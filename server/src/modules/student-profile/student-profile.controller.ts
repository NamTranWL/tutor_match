import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { ParentRole } from '@/decorator/roles.decorator';

@Controller('student-profiles')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class StudentProfileController {
  constructor(private readonly service: StudentProfileService) {}

  @Post()
  @ParentRole()
  create(@Req() req: any, @Body() dto: CreateStudentProfileDto) {
    // Auto-inject parentId from authenticated user
    const user = req.user;
    return this.service.createForParent(user.id, dto);
  }

  @Get(':id')
  @ParentRole()
  findOne(@Req() req: any, @Param('id') id: string) {
    // Ownership check
    const user = req.user;
    return this.service.findOneWithOwnership(user.id, id);
  }

  @Get('by-parent/:parentId')
  @ParentRole()
  findByParent(@Req() req: any, @Param('parentId') parentId: string) {
    // Ownership check: ensure requesting user owns this parent profile
    const user = req.user;
    return this.service.findByParentIdWithOwnership(user.id, parentId);
  }

  @Patch(':id')
  @ParentRole()
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    const user = req.user;
    return this.service.updateWithOwnership(user.id, id, dto);
  }
}
