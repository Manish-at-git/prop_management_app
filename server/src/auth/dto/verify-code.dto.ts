import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ example: 'PARTNER-99' })
  @IsString()
  @IsNotEmpty({ message: 'Access Code is required' })
  code: string;
}
