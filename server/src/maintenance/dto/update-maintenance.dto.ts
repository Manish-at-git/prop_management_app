import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ example: 'Updated title for the request' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description with more details.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: MaintenancePriority })
  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;

  @ApiPropertyOptional({ enum: MaintenanceStatus })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;
}
