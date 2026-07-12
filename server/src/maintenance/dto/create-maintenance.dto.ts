import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MaintenancePriority } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'Broken Elevator in Block A' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ example: 'The elevator in Block A has been stuck between floors 3 and 4 since morning.' })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiPropertyOptional({ enum: MaintenancePriority, default: MaintenancePriority.MEDIUM })
  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;
}
