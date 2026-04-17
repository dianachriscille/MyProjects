import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../../core/decorators/roles.decorator';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto, EnrollmentQueryDto } from './dto';

@Controller('api/v1/enrollments')
export class EnrollmentController {
  constructor(private service: EnrollmentService) {}

  @Post()
  @Roles('registrar')
  create(@Req() req: any, @Body() dto: CreateEnrollmentDto) {
    return this.service.create(req.user.orgId, req.user.id, dto);
  }

  @Get()
  @Roles('registrar', 'admin')
  findAll(@Req() req: any, @Query() query: EnrollmentQueryDto) {
    return this.service.findAll(req.user.orgId, query);
  }

  @Get(':id')
  @Roles('registrar', 'admin')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.orgId, id);
  }

  @Patch(':id/submit')
  @Roles('registrar')
  submit(@Req() req: any, @Param('id') id: string) {
    return this.service.submit(req.user.orgId, id);
  }

  @Patch(':id/approve')
  @Roles('registrar')
  approve(@Req() req: any, @Param('id') id: string) {
    return this.service.approve(req.user.orgId, id, req.user.id);
  }

  @Patch(':id/reject')
  @Roles('registrar')
  reject(@Req() req: any, @Param('id') id: string) {
    return this.service.reject(req.user.orgId, id, req.user.id);
  }
}
