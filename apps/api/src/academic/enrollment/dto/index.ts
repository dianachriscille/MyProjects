import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentDto {
  @IsNotEmpty() schoolYearId: string;
  @IsIn(['K', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12']) gradeLevel: string;
  @IsNotEmpty() applicantData: Record<string, any>;
  @IsBoolean() dpaConsentGiven: boolean;
}

export class EnrollmentQueryDto {
  @IsOptional() status?: string;
  @IsOptional() schoolYearId?: string;
  @IsOptional() gradeLevel?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}
