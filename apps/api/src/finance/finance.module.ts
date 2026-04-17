import { Module } from '@nestjs/common';
import { BillingController } from './billing/billing.controller';
import { BillingService } from './billing/billing.service';
import { PaymentService } from './payment/payment.service';
import { FinanceEventListener } from './listeners/finance-event.listener';

@Module({
  controllers: [BillingController],
  providers: [BillingService, PaymentService, FinanceEventListener],
})
export class FinanceModule {}
