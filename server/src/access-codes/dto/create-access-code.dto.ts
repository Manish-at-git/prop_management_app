import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAccessCodeDto {
  @ApiProperty({ example: 'association-uuid-here' })
  @IsString()
  @IsNotEmpty()
  associationId: string;

  @ApiPropertyOptional({ example: 'PARTNER-99' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Manish Suthar' })
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @ApiProperty({ example: 'manis@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '1414141414' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ default: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  expiresInDays?: number = 30;
}
