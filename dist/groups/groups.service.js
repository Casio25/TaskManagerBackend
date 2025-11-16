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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
function makeToken(inviteId, secret) {
    return `${inviteId}.${secret}`;
}
function parseToken(token) {
    const [idStr, secret] = token.split('.', 2);
    const id = Number(idStr);
    if (!id || !secret)
        throw new common_1.ForbiddenException('Invalid token');
    return { id, secret };
}
let GroupsService = class GroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createGroup(userId, dto) {
        const group = await this.prisma.group.create({
            data: {
                name: dto.name,
                adminId: userId,
                users: {
                    create: { userId },
                },
            },
        });
        return group;
    }
    async ensureGroupAdmin(groupId, userId) {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        if (group.adminId !== userId)
            throw new common_1.ForbiddenException('Only group admin allowed');
        return group;
    }
    async createInvite(groupId, invitedById, dto) {
        await this.ensureGroupAdmin(groupId, invitedById);
        const expiresInDays = dto.expiresInDays ?? 7;
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
        const secret = crypto.randomBytes(24).toString('hex');
        const tokenHash = await bcrypt.hash(secret, 10);
        const invite = await this.prisma.groupInvitation.create({
            data: {
                email: dto.email,
                groupId,
                invitedById,
                tokenHash,
                expiresAt,
            },
        });
        const token = makeToken(invite.id, secret);
        return { invite, token };
    }
    async acceptInvite(userId, userEmail, dto) {
        const { id, secret } = parseToken(dto.token);
        const invite = await this.prisma.groupInvitation.findUnique({
            where: { id },
        });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.status !== 'PENDING')
            throw new common_1.ForbiddenException('Invite is not active');
        if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
            throw new common_1.ForbiddenException('Invite expired');
        }
        if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new common_1.ForbiddenException('Invite email mismatch');
        }
        const ok = await bcrypt.compare(secret, invite.tokenHash);
        if (!ok)
            throw new common_1.ForbiddenException('Invalid token');
        await this.prisma.userGroup.upsert({
            where: { userId_groupId: { userId, groupId: invite.groupId } },
            create: { userId, groupId: invite.groupId },
            update: {},
        });
        const updated = await this.prisma.groupInvitation.update({
            where: { id: invite.id },
            data: {
                status: 'ACCEPTED',
                acceptedById: userId,
                acceptedAt: new Date(),
            },
        });
        return { invitation: updated };
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map