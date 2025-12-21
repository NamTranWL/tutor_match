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
} from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Controller('student-profiles')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class StudentProfileController {
  constructor(private readonly service: StudentProfileService) {}

  @Post()
  create(@Body() dto: CreateStudentProfileDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('by-parent/:parentId')
  findByParent(@Param('parentId') parentId: string) {
    return this.service.findByParentId(parentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentProfileDto) {
    return this.service.update(id, dto);
  }
}
