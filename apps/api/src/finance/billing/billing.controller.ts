import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../../core/decorators/roles.decorator';
import { BillingService } from './billing.service';
import { PaymentService } from '../payment/payment.service';
import { CreateBillingDto, CreateBulkBillingDto, BillingQueryDto, CreatePaymentDto } from './dto';

@Controller('api/v1/billing')
export class BillingController {
  constructor(private billingService: BillingService, private paymentService: PaymentService) {}

  @Post()
  @Roles('finance')
  create(@Req() req: any, @Body() dto: CreateBillingDto) {
    return this.billingService.create(req.user.orgId, req.user.id, dto);
  }

  @Post('bulk')
  @Roles('finance')
  createBulk(@Req() req: any, @Body() dto: CreateBulkBillingDto) {
    return this.billingService.createBulk(req.user.orgId, req.user.id, dto);
  }

  @Get()
  @Roles('finance', 'admin')
  findAll(@Req() req: any, @Query() query: BillingQueryDto) {
    return this.billingService.findAll(req.user.orgId, query);
  }

  @Get(':id')
  @Roles('finance', 'admin')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.billingService.findOne(req.user.orgId, id);
  }

  @Post(':id/payments')
  @Roles('finance')
  recordPayment(@Req() req: any, @Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.paymentService.create(req.user.orgId, id, req.user.id, dto);
  }

  @Get(':id/payments')
  @Roles('finance', 'admin')
  getPayments(@Param('id') id: string) {
    return this.paymentService.findByBilling(id);
  }
}
