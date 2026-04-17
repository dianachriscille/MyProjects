import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AcademicModule } from './academic/academic.module';
import { FinanceModule } from './finance/finance.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [CoreModule, AcademicModule, FinanceModule, AdminModule],
})
export class AppModule {}
