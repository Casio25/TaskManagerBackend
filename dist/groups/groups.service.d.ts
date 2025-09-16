import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupInviteDto } from './dto/create-group-invite.dto';
import { AcceptGroupInviteDto } from './dto/accept-group-invite.dto';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    createGroup(userId: number, dto: CreateGroupDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        adminId: number;
    }>;
    ensureGroupAdmin(groupId: number, userId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        adminId: number;
    }>;
    createInvite(groupId: number, invitedById: number, dto: CreateGroupInviteDto): Promise<{
        invite: {
            status: import(".prisma/client").$Enums.InvitationStatus;
            id: number;
            groupId: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            invitedById: number;
            tokenHash: string;
            expiresAt: Date | null;
            acceptedById: number | null;
            acceptedAt: Date | null;
        };
        token: string;
    }>;
    acceptInvite(userId: number, userEmail: string, dto: AcceptGroupInviteDto): Promise<{
        invitation: {
            status: import(".prisma/client").$Enums.InvitationStatus;
            id: number;
            groupId: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            invitedById: number;
            tokenHash: string;
            expiresAt: Date | null;
            acceptedById: number | null;
            acceptedAt: Date | null;
        };
    }>;
}
