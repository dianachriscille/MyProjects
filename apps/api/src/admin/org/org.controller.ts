import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { Roles } from '../../core/decorators/roles.decorator';
import { PrismaService } from '../../core/prisma.service';

@Controller('api/v1/org')
@Roles('admin')
export class OrgController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getProfile(@Req() req: any) {
    return this.prisma.organization.findFirst({ where: { id: req.user.orgId } });
  }

  @Patch()
  async updateProfile(@Req() req: any, @Body() dto: any) {
    return this.prisma.organization.update({ where: { id: req.user.orgId }, data: dto });
  }
}
