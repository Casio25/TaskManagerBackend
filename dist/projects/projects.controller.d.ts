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
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        groupId: number | null;
        description: string | null;
        creatorId: number;
        deadline: Date | null;
    }>;
    invite(req: any, id: number, dto: CreateProjectInviteDto): Promise<{
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
        link: string;
    }>;
    accept(req: any, dto: AcceptProjectInviteDto): Promise<{
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
    mine(req: any): Promise<{
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
