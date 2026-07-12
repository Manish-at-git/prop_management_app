import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssociationStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AssociationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AssociationStatus })
  @IsEnum(AssociationStatus)
  @IsOptional()
  status?: AssociationStatus;
}
