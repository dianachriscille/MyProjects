import { IsNotEmpty, IsOptional, IsIn, IsEmail, Matches, MaxLength, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsNotEmpty() @MaxLength(100) firstName: string;
  @IsOptional() @MaxLength(100) middleName?: string;
  @IsNotEmpty() @MaxLength(100) lastName: string;
  @IsDateString() dateOfBirth: string;
  @IsIn(['male', 'female']) gender: string;
  @IsOptional() address?: Record<string, any>;
  @IsNotEmpty() @MaxLength(255) guardianName: string;
  @Matches(/^(09\d{9}|\+639\d{9})$/) guardianContact: string;
  @IsOptional() @IsEmail() guardianEmail?: string;
  @IsIn(['K', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12']) gradeLevel: string;
  @IsOptional() @Matches(/^\d{12}$/) lrn?: string;
  @IsOptional() @MaxLength(50) section?: string;
}

export class UpdateStudentDto {
  @IsOptional() @MaxLength(100) firstName?: string;
  @IsOptional() @MaxLength(100) middleName?: string;
  @IsOptional() @MaxLength(100) lastName?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsIn(['male', 'female']) gender?: string;
  @IsOptional() address?: Record<string, any>;
  @IsOptional() @MaxLength(255) guardianName?: string;
  @IsOptional() @Matches(/^(09\d{9}|\+639\d{9})$/) guardianContact?: string;
  @IsOptional() @IsEmail() guardianEmail?: string;
  @IsOptional() @IsIn(['K', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12']) gradeLevel?: string;
  @IsOptional() @Matches(/^\d{12}$/) lrn?: string;
  @IsOptional() @MaxLength(50) section?: string;
}

export class StudentQueryDto {
  @IsOptional() search?: string;
  @IsOptional() gradeLevel?: string;
  @IsOptional() status?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}
