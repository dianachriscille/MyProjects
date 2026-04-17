import { Module } from '@nestjs/common';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { EnrollmentController } from './enrollment/enrollment.controller';
import { EnrollmentService } from './enrollment/enrollment.service';

@Module({
  controllers: [StudentController, EnrollmentController],
  providers: [StudentService, EnrollmentService],
})
export class AcademicModule {}
