import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FinanceEventListener {
  private readonly logger = new Logger(FinanceEventListener.name);

  @OnEvent('enrollment.approved')
  handleEnrollmentApproved(payload: { enrollmentId: string; studentId: string; gradeLevel: string }) {
    this.logger.log(`Student ${payload.studentId} (Grade ${payload.gradeLevel}) is now eligible for billing`);
  }

  @OnEvent('student.deleted')
  handleStudentDeleted(payload: { studentId: string; orgId: string; reason: string }) {
    this.logger.log(`Student ${payload.studentId} deleted — billing records should be reviewed`);
  }
}
