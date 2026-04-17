import { Controller, Get, Query, Req } from '@nestjs/common';
import { Roles } from '../../core/decorators/roles.decorator';
import { PrismaService } from '../../core/prisma.service';

@Controller('api/v1/audit-logs')
@Roles('admin')
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: { entityType?: string; userId?: string; dateFrom?: string; dateTo?: string; page?: string; limit?: string }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: any = { orgId: req.user.orgId };
    if (query.entityType) where.entityType = query.entityType;
    if (query.userId) where.userId = query.userId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, email: true } } } }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, total, page, limit };
  }
}
