import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/prisma.service';
import { CreateEnrollmentDto, EnrollmentQueryDto } from './dto';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService, private events: EventEmitter2) {}

  async create(orgId: string, userId: string, dto: CreateEnrollmentDto) {
    if (!dto.dpaConsentGiven) throw new BadRequestException('DPA consent is required');
    return this.prisma.enrollment.create({
      data: { orgId, createdBy: userId, schoolYearId: dto.schoolYearId, gradeLevel: dto.gradeLevel, applicantData: dto.applicantData, dpaConsentGiven: dto.dpaConsentGiven, dpaConsentTimestamp: new Date(), status: 'draft' },
    });
  }

  async submit(orgId: string, id: string) {
    const enrollment = await this.findOneOrFail(orgId, id);
    if (!['draft', 'rejected'].includes(enrollment.status)) {
      throw new BadRequestException(`Cannot submit enrollment with status '${enrollment.status}'`);
    }
    return this.prisma.enrollment.update({ where: { id }, data: { status: 'submitted', submittedAt: new Date(), rejectedBy: null, rejectedAt: null } });
  }

  async approve(orgId: string, id: string, userId: string) {
    const enrollment = await this.findOneOrFail(orgId, id);
    if (enrollment.status !== 'submitted') {
      throw new BadRequestException(`Cannot approve enrollment with status '${enrollment.status}'`);
    }

    const appData = enrollment.applicantData as any;
    const student = await this.prisma.student.create({
      data: {
        orgId, firstName: appData.firstName, lastName: appData.lastName, middleName: appData.middleName,
        dateOfBirth: new Date(appData.dateOfBirth), gender: appData.gender, address: appData.address || {},
        guardianName: appData.guardianName, guardianContact: appData.guardianContact, guardianEmail: appData.guardianEmail,
        gradeLevel: enrollment.gradeLevel, lrn: appData.lrn, status: 'enrolled',
      },
    });

    const updated = await this.prisma.enrollment.update({
      where: { id }, data: { status: 'enrolled', approvedBy: userId, approvedAt: new Date(), studentId: student.id },
    });

    this.events.emit('enrollment.approved', { enrollmentId: id, studentId: student.id, gradeLevel: enrollment.gradeLevel, schoolYearId: enrollment.schoolYearId });
    return updated;
  }

  async reject(orgId: string, id: string, userId: string) {
    const enrollment = await this.findOneOrFail(orgId, id);
    if (enrollment.status !== 'submitted') {
      throw new BadRequestException(`Cannot reject enrollment with status '${enrollment.status}'`);
    }
    return this.prisma.enrollment.update({ where: { id }, data: { status: 'rejected', rejectedBy: userId, rejectedAt: new Date() } });
  }

  async findAll(orgId: string, query: EnrollmentQueryDto) {
    const { status, schoolYearId, gradeLevel, page = 1, limit = 20 } = query;
    const where: any = { orgId };
    if (status) where.status = status;
    if (schoolYearId) where.schoolYearId = schoolYearId;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { student: true, schoolYear: true } }),
      this.prisma.enrollment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(orgId: string, id: string) {
    return this.findOneOrFail(orgId, id);
  }

  private async findOneOrFail(orgId: string, id: string) {
    const enrollment = await this.prisma.enrollment.findFirst({ where: { id, orgId }, include: { student: true, schoolYear: true, createdByUser: true, approvedByUser: true, rejectedByUser: true } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }
}
