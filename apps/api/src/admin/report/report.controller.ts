import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../../core/decorators/roles.decorator';
import { PrismaService } from '../../core/prisma.service';

@Controller('api/v1/reports')
@Roles('admin')
export class ReportController {
  constructor(private prisma: PrismaService) {}

  @Get('students')
  async studentList(@Req() req: any, @Res() res: Response) {
    const students = await this.prisma.student.findMany({ where: { orgId: req.user.orgId, isDeleted: false }, orderBy: { lastName: 'asc' } });
    const header = 'LRN,Last Name,First Name,Grade Level,Section,Status,Guardian,Contact\n';
    const rows = students.map(s => `${s.lrn || ''},${s.lastName},${s.firstName},${s.gradeLevel},${s.section || ''},${s.status},${s.guardianName},${s.guardianContact}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(header + rows);
  }

  @Get('enrollments')
  async enrollmentSummary(@Req() req: any, @Query('schoolYearId') schoolYearId: string, @Res() res: Response) {
    const enrollments = await this.prisma.enrollment.groupBy({ by: ['gradeLevel', 'status'], where: { orgId: req.user.orgId, schoolYearId }, _count: true });
    const header = 'Grade Level,Status,Count\n';
    const rows = enrollments.map(e => `${e.gradeLevel},${e.status},${e._count}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=enrollment-summary.csv');
    res.send(header + rows);
  }

  @Get('billing')
  async billingSummary(@Req() req: any, @Query('schoolYearId') schoolYearId: string, @Res() res: Response) {
    const billings = await this.prisma.billing.findMany({ where: { orgId: req.user.orgId, schoolYearId }, include: { student: true } });
    const header = 'Student,Grade Level,Total Amount,Total Paid,Balance,Status\n';
    const rows = billings.map(b => `${b.student.lastName} ${b.student.firstName},${b.student.gradeLevel},${b.totalAmount},${b.totalPaid},${b.balance},${b.status}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=billing-summary.csv');
    res.send(header + rows);
  }
}
