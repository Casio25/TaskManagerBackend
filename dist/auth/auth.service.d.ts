import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private hashPassword;
    private comparePassword;
    private signToken;
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
}
