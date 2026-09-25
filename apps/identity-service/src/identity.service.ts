import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { CreateUserDto, VerifyCredentialsDto } from './identity.dto';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    if (!dto?.email || !dto.password || !dto.displayName) {
      throw new BadRequestException('email, password, and displayName are required');
    }

    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email is already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, displayName: dto.displayName.trim() },
      select: { id: true, email: true, displayName: true, roles: true, isActive: true, createdAt: true },
    });

    return user;
  }

  async verifyCredentials(dto: VerifyCredentialsDto) {
    if (!dto?.email || !dto.password) {
      throw new BadRequestException('email and password are required');
    }

    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, roles: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
