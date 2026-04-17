import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return next.handle();

    const action = method === 'DELETE' ? 'delete' : method === 'POST' ? 'create' : 'update';
    const entityType = this.extractEntityType(request.route?.path || request.url);
    const entityId = request.params?.id;

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          if (!request.user?.orgId) return;
          await this.prisma.auditLog.create({
            data: {
              orgId: request.user.orgId,
              userId: request.user.id,
              action,
              entityType,
              entityId: entityId || responseData?.id || 'unknown',
              newValues: responseData || undefined,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        } catch {
          // Audit logging should never break the request
        }
      }),
    );
  }

  private extractEntityType(path: string): string {
    const segments = path.replace('/api/v1/', '').split('/');
    return segments[0] || 'unknown';
  }
}
