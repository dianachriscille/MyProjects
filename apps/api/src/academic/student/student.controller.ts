import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../../core/decorators/roles.decorator';
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto';

@Controller('api/v1/students')
export class StudentController {
  constructor(private service: StudentService) {}

  @Post()
  @Roles('registrar', 'admin')
  create(@Req() req: any, @Body() dto: CreateStudentDto) {
    return this.service.create(req.user.orgId, dto);
  }

  @Get()
  @Roles('registrar', 'admin')
  findAll(@Req() req: any, @Query() query: StudentQueryDto) {
    return this.service.findAll(req.user.orgId, query);
  }

  @Get(':id')
  @Roles('registrar', 'admin')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.orgId, id);
  }

  @Patch(':id')
  @Roles('registrar')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.service.update(req.user.orgId, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  softDelete(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.service.softDelete(req.user.orgId, id, reason);
  }

  @Get(':id/export')
  @Roles('admin')
  exportData(@Req() req: any, @Param('id') id: string) {
    return this.service.exportData(req.user.orgId, id);
  }
}
