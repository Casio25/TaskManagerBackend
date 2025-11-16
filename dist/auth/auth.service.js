"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async hashPassword(plain) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(plain, salt);
    }
    async comparePassword(plain, hash) {
        return bcrypt.compare(plain, hash);
    }
    signToken(payload) {
        return this.jwt.sign(payload);
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.ConflictException('Email already in use');
        const password = await this.hashPassword(dto.password);
        const role = dto.role ?? 'MEMBER';
        const user = await this.prisma.user.create({
            data: { email: dto.email, password, name: dto.name, role },
        });
        const access_token = this.signToken({ email: user.email });
        const { password: _, ...safe } = user;
        return { user: safe, access_token };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const ok = await this.comparePassword(dto.password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const access_token = this.signToken({ email: user.email });
        const { password: _, ...safe } = user;
        return { user: safe, access_token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map