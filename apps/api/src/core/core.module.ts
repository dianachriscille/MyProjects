import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './prisma.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { HealthController } from './health/health.controller';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000, limit: parseInt(process.env.THROTTLE_LIMIT || '10') }]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [HealthController],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
  exports: [PrismaService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
