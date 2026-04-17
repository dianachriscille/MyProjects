import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PaymentService } from '../../src/finance/payment/payment.service';
import { PrismaService } from '../../src/core/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: any;
  let events: any;

  beforeEach(async () => {
    prisma = { billing: { findFirst: jest.fn(), update: jest.fn() }, payment: { create: jest.fn(), findMany: jest.fn() } };
    events = { emit: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [PaymentService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();
    service = module.get(PaymentService);
  });

  it('should reject payment exceeding balance', async () => {
    prisma.billing.findFirst.mockResolvedValue({ id: 'b1', orgId: 'org1', totalAmount: 10000, totalPaid: 8000, balance: 2000 });
    await expect(service.create('org1', 'b1', 'user1', { amount: 3000, paymentDate: '2025-01-15', paymentMethod: 'bank_transfer' }))
      .rejects.toThrow(BadRequestException);
  });

  it('should set status to fully_paid when balance reaches zero', async () => {
    prisma.billing.findFirst.mockResolvedValue({ id: 'b1', orgId: 'org1', totalAmount: 10000, totalPaid: 8000, balance: 2000, studentId: 's1', schoolYearId: 'sy1' });
    prisma.payment.create.mockResolvedValue({ id: 'p1' });
    prisma.billing.update.mockResolvedValue({});
    await service.create('org1', 'b1', 'user1', { amount: 2000, paymentDate: '2025-01-15', paymentMethod: 'bank_transfer' });
    expect(prisma.billing.update).toHaveBeenCalledWith({ where: { id: 'b1' }, data: expect.objectContaining({ status: 'fully_paid' }) });
    expect(events.emit).toHaveBeenCalledWith('billing.fully_paid', expect.any(Object));
  });

  it('should set status to partially_paid for partial payment', async () => {
    prisma.billing.findFirst.mockResolvedValue({ id: 'b1', orgId: 'org1', totalAmount: 10000, totalPaid: 0, balance: 10000, studentId: 's1', schoolYearId: 'sy1' });
    prisma.payment.create.mockResolvedValue({ id: 'p1' });
    prisma.billing.update.mockResolvedValue({});
    await service.create('org1', 'b1', 'user1', { amount: 5000, paymentDate: '2025-01-15', paymentMethod: 'bank_transfer' });
    expect(prisma.billing.update).toHaveBeenCalledWith({ where: { id: 'b1' }, data: expect.objectContaining({ status: 'partially_paid' }) });
  });
});
