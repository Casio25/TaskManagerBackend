import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
        };
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            email: string;
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
        };
        access_token: string;
    }>;
    me(req: any): Promise<any>;
}
