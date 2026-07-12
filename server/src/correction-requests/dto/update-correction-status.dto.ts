import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CorrectionRequestStatus } from '@prisma/client';

export class UpdateCorrectionStatusDto {
  @ApiProperty({ enum: CorrectionRequestStatus, example: CorrectionRequestStatus.RESOLVED })
  @IsEnum(CorrectionRequestStatus)
  @IsNotEmpty()
  status: CorrectionRequestStatus;
}
