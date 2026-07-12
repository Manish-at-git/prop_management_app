import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssociationStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssociationDto {
  @ApiProperty({ example: 'IEEE - Global Technological Institute' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'IEEE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'ieee-support@ieee.org' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1414141414' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: AssociationStatus, default: AssociationStatus.ACTIVE })
  @IsEnum(AssociationStatus)
  @IsOptional()
  status?: AssociationStatus;
}
