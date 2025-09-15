import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProject(userId: number, dto: CreateProjectDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        groupId: number | null;
        description: string | null;
        creatorId: number;
        deadline: Date | null;
    }>;
    ensureProjectAdmin(projectId: number, userId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        groupId: number | null;
        description: string | null;
        creatorId: number;
        deadline: Date | null;
    }>;
    createInvite(projectId: number, invitedById: number, dto: CreateProjectInviteDto): Promise<{
        invite: {
            email: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            invitedById: number;
            tokenHash: string;
            status: import(".prisma/client").$Enums.InvitationStatus;
            expiresAt: Date | null;
            acceptedById: number | null;
            acceptedAt: Date | null;
            projectId: number;
        };
        token: string;
    }>;
    acceptInvite(userId: number, userEmail: string, dto: AcceptProjectInviteDto): Promise<{
        invitation: {
            email: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            invitedById: number;
            tokenHash: string;
            status: import(".prisma/client").$Enums.InvitationStatus;
            expiresAt: Date | null;
            acceptedById: number | null;
            acceptedAt: Date | null;
            projectId: number;
        };
    }>;
    myProjects(userId: number): Promise<{
        admin: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            groupId: number | null;
            description: string | null;
            creatorId: number;
            deadline: Date | null;
        }[];
        member: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            groupId: number | null;
            description: string | null;
            creatorId: number;
            deadline: Date | null;
        }[];
    }>;
}
