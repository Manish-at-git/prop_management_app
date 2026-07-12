import { Module } from '@nestjs/common';
import { CodeRequestsService } from './code-requests.service';
import { CodeRequestsController } from './code-requests.controller';

@Module({
  controllers: [CodeRequestsController],
  providers: [CodeRequestsService],
  exports: [CodeRequestsService],
})
export class CodeRequestsModule {}
