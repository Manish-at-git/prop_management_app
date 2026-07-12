import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-uuid-here', description: 'The target user ID' })
  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({ example: 'Maintenance Request Update' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ example: 'Your maintenance request #1234 has been resolved.' })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}
