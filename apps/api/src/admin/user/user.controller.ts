import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';

@Controller('api/v1/users')
@Roles('admin')
export class UserController {
  constructor(private service: UserService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateUserDto) { return this.service.create(req.user.orgId, dto); }

  @Get()
  findAll(@Req() req: any, @Query() query: UserQueryDto) { return this.service.findAll(req.user.orgId, query); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) { return this.service.update(req.user.orgId, id, dto); }

  @Patch(':id/deactivate')
  deactivate(@Req() req: any, @Param('id') id: string) { return this.service.deactivate(req.user.orgId, id); }
}
