import { IsEmail, IsIn, IsNotEmpty, IsOptional, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail() email: string;
  @IsNotEmpty() @MaxLength(100) firstName: string;
  @IsNotEmpty() @MaxLength(100) lastName: string;
  @IsIn(['admin', 'registrar', 'finance']) role: string;
}

export class UpdateUserDto {
  @IsOptional() @MaxLength(100) firstName?: string;
  @IsOptional() @MaxLength(100) lastName?: string;
  @IsOptional() @IsIn(['admin', 'registrar', 'finance']) role?: string;
}

export class UserQueryDto {
  @IsOptional() search?: string;
  @IsOptional() role?: string;
  @IsOptional() status?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}
