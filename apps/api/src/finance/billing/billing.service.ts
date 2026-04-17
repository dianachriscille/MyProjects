import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../core/prisma.service';
import { CreateBillingDto, CreateBulkBillingDto, BillingQueryDto } from './dto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateBillingDto) {
    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, orgId, isDeleted: false, status: 'enrolled' } });
    if (!student) throw new BadRequestException('Student must be enrolled');

    const existing = await this.prisma.billing.findUnique({ where: { studentId_schoolYearId: { studentId: dto.studentId, schoolYearId: dto.schoolYearId } } });
    if (existing) throw new ConflictException('Billing already exists for this student and school year');

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);
    return this.prisma.billing.create({
      data: {
        orgId, studentId: dto.studentId, schoolYearId: dto.schoolYearId, dueDate: new Date(dto.dueDate),
        totalAmount, balance: totalAmount, createdBy: userId,
        items: { create: dto.items.map((item, i) => ({ description: item.description, amount: item.amount, sortOrder: i })) },
      },
      include: { items: true },
    });
  }

  async createBulk(orgId: string, userId: string, dto: CreateBulkBillingDto) {
    const students = await this.prisma.student.findMany({ where: { orgId, gradeLevel: dto.gradeLevel, status: 'enrolled', isDeleted: false } });
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);
    let created = 0, skipped = 0;
    const skippedStudents: string[] = [];

    for (const student of students) {
      const existing = await this.prisma.billing.findUnique({ where: { studentId_schoolYearId: { studentId: student.id, schoolYearId: dto.schoolYearId } } });
      if (existing) { skipped++; skippedStudents.push(`${student.lastName}, ${student.firstName}`); continue; }
      await this.prisma.billing.create({
        data: {
          orgId, studentId: student.id, schoolYearId: dto.schoolYearId, dueDate: new Date(dto.dueDate),
          totalAmount, balance: totalAmount, createdBy: userId,
          items: { create: dto.items.map((item, i) => ({ description: item.description, amount: item.amount, sortOrder: i })) },
        },
      });
      created++;
    }
    return { created, skipped, skippedStudents };
  }

  async findAll(orgId: string, query: BillingQueryDto) {
    const { status, gradeLevel, schoolYearId, page = 1, limit = 20 } = query;
    const where: any = { orgId };
    if (status) where.status = status;
    if (schoolYearId) where.schoolYearId = schoolYearId;
    if (gradeLevel) where.student = { gradeLevel, isDeleted: false };
    const [data, total] = await Promise.all([
      this.prisma.billing.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { student: true, items: true, schoolYear: true } }),
      this.prisma.billing.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(orgId: string, id: string) {
    const billing = await this.prisma.billing.findFirst({ where: { id, orgId }, include: { student: true, items: { orderBy: { sortOrder: 'asc' } }, payments: { orderBy: { paymentDate: 'desc' } }, schoolYear: true } });
    if (!billing) throw new NotFoundException('Billing not found');
    return billing;
  }
}
