import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssociationStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAssociationDto {
  @ApiPropertyOptional({ example: 'IEEE - Institute of Electrical and Electronics Engineers' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'ieee-admin@ieee.org' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1999999999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: AssociationStatus })
  @IsEnum(AssociationStatus)
  @IsOptional()
  status?: AssociationStatus;
}
