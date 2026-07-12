import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Annual Budget 2026' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiPropertyOptional({ example: 'The approved annual budget details for the association.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/files/budget2026.pdf' })
  @IsString()
  @IsNotEmpty({ message: 'File URL is required' })
  fileUrl: string;

  @ApiProperty({ example: 'association-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Association ID is required' })
  associationId: string;
}
