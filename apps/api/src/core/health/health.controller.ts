import { Controller, Get } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { PrismaService } from '../prisma.service';

@Controller('api/v1/health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {}
    return { status: 'ok', timestamp: new Date().toISOString(), database: dbStatus, version: '1.0.0' };
  }
}
