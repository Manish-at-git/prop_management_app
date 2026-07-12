import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestCodeDto {
  @ApiProperty({ example: 'association-uuid-here' })
  @IsString()
  @IsNotEmpty({ message: 'Association ID is required' })
  associationId: string;

  @ApiProperty({ example: 'Manish Suthar' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'manis@gmail.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '1414141414', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
