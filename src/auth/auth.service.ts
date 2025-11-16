import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private async hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }

  private async comparePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  private signToken(payload: { email: string }) {
    return this.jwt.sign(payload);
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already in use');

    const password = await this.hashPassword(dto.password);
    const role: Role = dto.role ?? 'MEMBER';

    const user = await this.prisma.user.create({
      data: { email: dto.email, password, name: dto.name, role },
    });

    const access_token = this.signToken({ email: user.email });
    const { password: _, ...safe } = user;
    return { user: safe, access_token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await this.comparePassword(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const access_token = this.signToken({ email: user.email });
    const { password: _, ...safe } = user;
    return { user: safe, access_token };
  }
}
