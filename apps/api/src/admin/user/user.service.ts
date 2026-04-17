import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../core/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';

@Injectable()
export class UserService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateUserDto) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email, email_confirm: true,
      user_metadata: { role: dto.role, org_id: orgId, first_name: dto.firstName, last_name: dto.lastName },
    });
    if (error) throw new BadRequestException(`Supabase error: ${error.message}`);

    return this.prisma.user.create({
      data: { orgId, email: dto.email, firstName: dto.firstName, lastName: dto.lastName, role: dto.role, supabaseId: data.user.id },
    });
  }

  async findAll(orgId: string, query: UserQueryDto) {
    const { search, role, status, page = 1, limit = 20 } = query;
    const where: any = { orgId };
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) { where.OR = [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]; }
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { lastName: 'asc' } }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async update(orgId: string, id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, orgId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async deactivate(orgId: string, id: string) {
    const activeAdmins = await this.prisma.user.count({ where: { orgId, role: 'admin', status: 'active' } });
    const user = await this.prisma.user.findFirst({ where: { id, orgId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'admin' && activeAdmins <= 1) throw new BadRequestException('Cannot deactivate the last admin');

    if (user.supabaseId) {
      await this.supabase.auth.admin.updateUserById(user.supabaseId, { ban_duration: '876000h' });
    }
    return this.prisma.user.update({ where: { id }, data: { status: 'inactive' } });
  }
}
