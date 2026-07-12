import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssociationsModule } from './associations/associations.module';
import { AccessCodesModule } from './access-codes/access-codes.module';
import { CodeRequestsModule } from './code-requests/code-requests.module';
import { CorrectionRequestsModule } from './correction-requests/correction-requests.module';
import { DocumentsModule } from './documents/documents.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { NotificationsModule } from './notifications/notifications.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting - 100 requests per minute globally
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute (in milliseconds)
        limit: 100,
      },
    ]),

    // Core
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AssociationsModule,
    AccessCodesModule,
    CodeRequestsModule,
    CorrectionRequestsModule,
    // DocumentsModule,
    // MaintenanceModule,
    // NotificationsModule,
  ],
  providers: [
    // Apply JwtAuthGuard globally; routes can opt-out with @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply RolesGuard globally; routes can define required roles with @Roles()
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
