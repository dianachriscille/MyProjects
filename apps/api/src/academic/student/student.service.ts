import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/prisma.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService, private events: EventEmitter2) {}

  async create(orgId: string, dto: CreateStudentDto) {
    return this.prisma.student.create({ data: { orgId, ...dto, dateOfBirth: new Date(dto.dateOfBirth) } });
  }

  async findAll(orgId: string, query: StudentQueryDto) {
    const { search, gradeLevel, status, page = 1, limit = 20 } = query;
    const where: any = { orgId, isDeleted: false };
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { lrn: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.student.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { lastName: 'asc' } }),
      this.prisma.student.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(orgId: string, id: string) {
    const student = await this.prisma.student.findFirst({ where: { id, orgId, isDeleted: false }, include: { enrollments: true, billings: { include: { items: true, payments: true } } } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(orgId: string, id: string, dto: UpdateStudentDto) {
    await this.findOne(orgId, id);
    const data: any = { ...dto };
    if (dto.dateOfBirth) data.dateOfBirth = new Date(dto.dateOfBirth);
    return this.prisma.student.update({ where: { id }, data });
  }

  async softDelete(orgId: string, id: string, reason: string) {
    await this.findOne(orgId, id);
    await this.prisma.student.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date(), deletedReason: reason } });
    this.events.emit('student.deleted', { studentId: id, orgId, reason });
  }

  async exportData(orgId: string, id: string) {
    return this.findOne(orgId, id);
  }
}
