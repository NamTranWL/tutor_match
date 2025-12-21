import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MongoIdParamDto } from './dto/mongo-id-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '@/decorator/customize';
import { ListUsersQueryDto } from './dto/list-users.query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param() { id }: MongoIdParamDto, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Delete(':id')
  async remove(@Param() { id }: MongoIdParamDto, @Query('hard') hard?: string) {
    const isHard = ['1', 'true', 'yes'].includes((hard || '').toLowerCase());
    return isHard
      ? this.usersService.hardDelete(id)
      : this.usersService.softDelete(id);
  }
}
