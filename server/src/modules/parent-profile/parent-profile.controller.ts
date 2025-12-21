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
import { ParentProfileService } from './parent-profile.service';
import { CreateParentProfileDto } from './dto/create-parent-profile.dto';
import { UpdateParentProfileDto } from './dto/update-parent-profile.dto';

@Controller('parent-profiles')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ParentProfileController {
  constructor(private readonly service: ParentProfileService) {}

  @Post()
  create(@Body() dto: CreateParentProfileDto) {
    return this.service.create(dto);
  }

  @Get('by-user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParentProfileDto) {
    return this.service.update(id, dto);
  }
}
