import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProject(userId: number, dto: CreateProjectDto): Promise<{
        id: any;
        name: any;
        description: any;
        createdAt: any;
        updatedAt: any;
        deadline: any;
        tasks: any;
    }>;
    private loadProjectWithTasks;
    private mapProject;
    ensureProjectAdmin(projectId: number, userId: number): Promise<{
        description: string | null;
        deadline: Date | null;
        id: number;
        name: string;
        creatorId: number;
        groupId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createInvite(projectId: number, invitedById: number, dto: CreateProjectInviteDto): Promise<{
        invite: {
            projectId: number;
            status: import(".prisma/client").$Enums.InvitationStatus;
            id: number;
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
    acceptInvite(userId: number, userEmail: string, dto: AcceptProjectInviteDto): Promise<{
        invitation: {
            projectId: number;
            status: import(".prisma/client").$Enums.InvitationStatus;
            id: number;
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
    myProjects(userId: number): Promise<{
        admin: {
            id: any;
            name: any;
            description: any;
            createdAt: any;
            updatedAt: any;
            deadline: any;
            tasks: any;
        }[];
        member: {
            id: any;
            name: any;
            description: any;
            createdAt: any;
            updatedAt: any;
            deadline: any;
            tasks: any;
        }[];
    }>;
    deleteProject(userId: number, projectId: number): Promise<{
        success: boolean;
    }>;
}
