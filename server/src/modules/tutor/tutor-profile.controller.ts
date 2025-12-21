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
import { TutorProfileService } from './tutor-profile.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { MongoIdParamDto } from './dto/mongo-id-param.dto';
import {
  AdminRole,
  TutorRole,
  ParentRole,
  RolesAny,
} from '@/decorator/roles.decorator';

@Controller('tutor')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TutorProfileController {
  constructor(private readonly service: TutorProfileService) {}

  @Post()
  create(@Body() dto: CreateTutorProfileDto) {
    return this.service.create(dto);
  }

  @AdminRole()
  @Get()
  findAll(
    @Query()
    query: {
      userId?: string;
      subjectId?: string;
      level?: string;
      mode?: 'online' | 'offline' | 'hybrid';
      verified?: string | boolean;
      minRate?: string | number;
      maxRate?: string | number;
      lat?: string | number;
      lng?: string | number;
      maxDistanceKm?: string | number;
      current?: string | number; // standardized pagination
      pageSize?: string | number; // standardized pagination
      sort?: 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
    },
  ) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param() { id }: MongoIdParamDto) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param() { id }: MongoIdParamDto, @Body() dto: UpdateTutorProfileDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param() { id }: MongoIdParamDto) {
    return this.service.remove(id);
  }
}
