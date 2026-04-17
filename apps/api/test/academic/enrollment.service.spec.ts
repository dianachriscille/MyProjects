import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EnrollmentService } from '../../src/academic/enrollment/enrollment.service';
import { PrismaService } from '../../src/core/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let prisma: any;
  let events: any;

  beforeEach(async () => {
    prisma = { enrollment: { create: jest.fn(), update: jest.fn(), findFirst: jest.fn() }, student: { create: jest.fn() } };
    events = { emit: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [EnrollmentService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();
    service = module.get(EnrollmentService);
  });

  it('should reject create without DPA consent', async () => {
    await expect(service.create('org1', 'user1', { schoolYearId: 'sy1', gradeLevel: 'G1', applicantData: {}, dpaConsentGiven: false }))
      .rejects.toThrow(BadRequestException);
  });

  it('should reject submit from non-draft status', async () => {
    prisma.enrollment.findFirst.mockResolvedValue({ id: '1', orgId: 'org1', status: 'approved' });
    await expect(service.submit('org1', '1')).rejects.toThrow(BadRequestException);
  });

  it('should reject approve from non-submitted status', async () => {
    prisma.enrollment.findFirst.mockResolvedValue({ id: '1', orgId: 'org1', status: 'draft' });
    await expect(service.approve('org1', '1', 'user1')).rejects.toThrow(BadRequestException);
  });

  it('should emit event on approve', async () => {
    const enrollment = { id: '1', orgId: 'org1', status: 'submitted', gradeLevel: 'G1', schoolYearId: 'sy1', applicantData: { firstName: 'Juan', lastName: 'Cruz', dateOfBirth: '2010-01-01', gender: 'male', guardianName: 'Maria', guardianContact: '09171234567' } };
    prisma.enrollment.findFirst.mockResolvedValue(enrollment);
    prisma.student.create.mockResolvedValue({ id: 'student1' });
    prisma.enrollment.update.mockResolvedValue({ ...enrollment, status: 'enrolled' });
    await service.approve('org1', '1', 'user1');
    expect(events.emit).toHaveBeenCalledWith('enrollment.approved', expect.objectContaining({ enrollmentId: '1' }));
  });
});
