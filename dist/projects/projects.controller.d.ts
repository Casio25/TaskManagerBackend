import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';
import { AcceptProjectInviteDto } from './dto/accept-project-invite.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { RateProjectDto } from './dto/rate-project.dto';
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
        status: any;
        completedAt: any;
        completedBy: {
            id: any;
            name: any;
            email: any;
        } | null;
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
    archived(req: any): Promise<{
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
    updateStatus(req: any, id: number, dto: UpdateProjectStatusDto): Promise<{
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
    rateProject(req: any, id: number, dto: RateProjectDto): Promise<{
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
    remove(req: any, id: number): Promise<{
        success: boolean;
    }>;
}
