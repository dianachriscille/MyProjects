import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { AuditController } from './audit/audit.controller';
import { ReportController } from './report/report.controller';
import { OrgController } from './org/org.controller';

@Module({
  controllers: [UserController, AuditController, ReportController, OrgController],
  providers: [UserService],
})
export class AdminModule {}
