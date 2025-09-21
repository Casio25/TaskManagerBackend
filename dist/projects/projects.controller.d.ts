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
        id: any;
        name: any;
        description: any;
        color: any;
        createdAt: any;
        updatedAt: any;
        deadline: any;
        tasks: any;
    }>;
    invite(req: any, id: number, dto: CreateProjectInviteDto): Promise<{
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
        link: string;
    }>;
    accept(req: any, dto: AcceptProjectInviteDto): Promise<{
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
    mine(req: any): Promise<{
        admin: {
            id: any;
            name: any;
            description: any;
            color: any;
            createdAt: any;
            updatedAt: any;
            deadline: any;
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
            tasks: any;
        }[];
    }>;
    remove(req: any, id: number): Promise<{
        success: boolean;
    }>;
}
