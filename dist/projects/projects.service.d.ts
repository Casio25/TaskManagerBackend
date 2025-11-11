import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
import { RateProjectDto } from './dto/rate-project.dto';
import { ProjectStatus } from '@prisma/client';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProject(userId: number, dto: CreateProjectDto): Promise<{
        id: any;
        name: any;
        description: any;
        color: any;
        createdAt: any;
        updatedAt: any;
        deadline: any;
        status: any;
        completedAt: any;
        completedBy: {
            id: any;
            name: any;
            email: any;
        } | null;
        tasks: any;
    }>;
    archivedProjects(userId: number): Promise<{
        id: any;
        name: any;
        description: any;
        color: any;
        createdAt: any;
        updatedAt: any;
        deadline: any;
        status: any;
        completedAt: any;
        completedBy: {
            id: any;
            name: any;
            email: any;
        } | null;
        tasks: any;
    }[]>;
    private loadProjectWithTasks;
    private mapProject;
    ensureProjectAdmin(projectId: number, userId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string;
        creatorId: number;
        groupId: number | null;
        deadline: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        completedAt: Date | null;
        completedById: number | null;
    }>;
    createInvite(projectId: number, invitedById: number, dto: CreateProjectInviteDto): Promise<{
        invite: {
            email: string;
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.InvitationStatus;
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
            email: string;
            projectId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.InvitationStatus;
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
            color: any;
            createdAt: any;
            updatedAt: any;
            deadline: any;
            status: any;
            completedAt: any;
            completedBy: {
                id: any;
                name: any;
                email: any;
            } | null;
            tasks: any;
        }[];
        member: {
            id: any;
            name: any;
            description: any;
            color: any;
            createdAt: any;
            updatedAt: any;
            deadline: any;
            status: any;
            completedAt: any;
            completedBy: {
                id: any;
                name: any;
                email: any;
            } | null;
            tasks: any;
        }[];
    }>;
    updateProjectStatus(userId: number, projectId: number, status: ProjectStatus): Promise<{
        id: any;
        name: any;
        description: any;
        color: any;
        createdAt: any;
        updatedAt: any;
        deadline: any;
        status: any;
        completedAt: any;
        completedBy: {
            id: any;
            name: any;
            email: any;
        } | null;
        tasks: any;
    }>;
    rateProject(adminId: number, projectId: number, dto: RateProjectDto): Promise<{
        rating: {
            projectId: number | null;
            taskId: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            scope: import(".prisma/client").$Enums.RatingScope;
            quality: number;
            punctuality: number;
            teamwork: number;
            comments: string | null;
            ratedById: number;
        };
    }>;
    deleteProject(userId: number, projectId: number): Promise<{
        success: boolean;
    }>;
}
