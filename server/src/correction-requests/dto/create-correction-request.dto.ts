import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCorrectionRequestDto {
  @ApiProperty({ example: 'Manish Suthar' })
  @IsString()
  @IsNotEmpty({ message: 'Requested name is required' })
  requestedName: string;

  @ApiProperty({ example: '123 Main St, Apartment 4B' })
  @IsString()
  @IsNotEmpty({ message: 'Requested address is required' })
  requestedAddress: string;

  @ApiProperty({ example: 'My name is misspelled and the apartment number is wrong.' })
  @IsString()
  @IsNotEmpty({ message: 'Reason for correction is required' })
  reason: string;
}
