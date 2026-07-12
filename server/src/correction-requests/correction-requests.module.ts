import { Module } from '@nestjs/common';
import { CorrectionRequestsService } from './correction-requests.service';
import { CorrectionRequestsController } from './correction-requests.controller';

@Module({
  controllers: [CorrectionRequestsController],
  providers: [CorrectionRequestsService],
  exports: [CorrectionRequestsService],
})
export class CorrectionRequestsModule {}
