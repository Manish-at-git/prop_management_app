import { Module } from '@nestjs/common';
import { AccessCodesService } from './access-codes.service';
import { AccessCodesController } from './access-codes.controller';

@Module({
  controllers: [AccessCodesController],
  providers: [AccessCodesService],
  exports: [AccessCodesService],
})
export class AccessCodesModule {}
