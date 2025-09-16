import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
import { MailService } from '../mail/mail.service';
export declare class ProjectsController {
    private projects;
    private mail;
    constructor(projects: ProjectsService, mail: MailService);
    create(req: any, dto: CreateProjectDto): Promise<{
        description: string | null;
        deadline: Date | null;
        id: number;
        name: string;
        creatorId: number;
        groupId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    invite(req: any, id: number, dto: CreateProjectInviteDto): Promise<{
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
        link: string;
    }>;
    accept(req: any, dto: AcceptProjectInviteDto): Promise<{
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
    mine(req: any): Promise<{
        admin: {
            description: string | null;
            deadline: Date | null;
            id: number;
            name: string;
            creatorId: number;
            groupId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        member: {
            description: string | null;
            deadline: Date | null;
            id: number;
            name: string;
            creatorId: number;
            groupId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    remove(req: any, id: number): Promise<{
        success: boolean;
    }>;
}
