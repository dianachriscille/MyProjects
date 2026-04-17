import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/prisma.service';
import { CreatePaymentDto } from '../billing/dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService, private events: EventEmitter2) {}

  async create(orgId: string, billingId: string, userId: string, dto: CreatePaymentDto) {
    const billing = await this.prisma.billing.findFirst({ where: { id: billingId, orgId } });
    if (!billing) throw new BadRequestException('Billing not found');

    const balance = Number(billing.balance);
    if (dto.amount > balance) {
      throw new BadRequestException(`Payment amount ${dto.amount} exceeds outstanding balance ${balance}`);
    }

    const payment = await this.prisma.payment.create({
      data: { billingId, amount: dto.amount, paymentDate: new Date(dto.paymentDate), paymentMethod: dto.paymentMethod, referenceNumber: dto.referenceNumber, notes: dto.notes, recordedBy: userId },
    });

    const newTotalPaid = Number(billing.totalPaid) + dto.amount;
    const newBalance = Number(billing.totalAmount) - newTotalPaid;
    const newStatus = newBalance <= 0 ? 'fully_paid' : newTotalPaid > 0 ? 'partially_paid' : 'unpaid';

    await this.prisma.billing.update({ where: { id: billingId }, data: { totalPaid: newTotalPaid, balance: newBalance, status: newStatus } });

    if (newStatus === 'fully_paid') {
      this.events.emit('billing.fully_paid', { billingId, studentId: billing.studentId, schoolYearId: billing.schoolYearId });
    }
    return payment;
  }

  async findByBilling(billingId: string) {
    return this.prisma.payment.findMany({ where: { billingId }, orderBy: { paymentDate: 'desc' } });
  }
}
