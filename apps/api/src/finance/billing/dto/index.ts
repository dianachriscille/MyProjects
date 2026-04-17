import { IsNotEmpty, IsOptional, IsPositive, IsDateString, IsArray, ArrayMinSize, ValidateNested, MaxLength, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class BillingItemDto {
  @IsNotEmpty() @MaxLength(255) description: string;
  @IsPositive() amount: number;
}

export class CreateBillingDto {
  @IsNotEmpty() studentId: string;
  @IsNotEmpty() schoolYearId: string;
  @IsDateString() dueDate: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => BillingItemDto) items: BillingItemDto[];
}

export class CreateBulkBillingDto {
  @IsNotEmpty() gradeLevel: string;
  @IsNotEmpty() schoolYearId: string;
  @IsDateString() dueDate: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => BillingItemDto) items: BillingItemDto[];
}

export class BillingQueryDto {
  @IsOptional() status?: string;
  @IsOptional() gradeLevel?: string;
  @IsOptional() schoolYearId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}

export class CreatePaymentDto {
  @IsPositive() amount: number;
  @IsDateString() paymentDate: string;
  @IsIn(['bank_transfer']) paymentMethod: string;
  @IsOptional() @MaxLength(100) referenceNumber?: string;
  @IsOptional() notes?: string;
}
