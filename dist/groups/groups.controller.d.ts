import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupInviteDto } from './dto/create-group-invite.dto';
import { AcceptGroupInviteDto } from './dto/accept-group-invite.dto';
import { MailService } from '../mail/mail.service';
export declare class GroupsController {
    private groups;
    private mail;
    constructor(groups: GroupsService, mail: MailService);
    create(req: any, dto: CreateGroupDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        adminId: number;
    }>;
    invite(req: any, id: number, dto: CreateGroupInviteDto): Promise<{
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
        link: string;
    }>;
    accept(req: any, dto: AcceptGroupInviteDto): Promise<{
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
    myGroups(req: any): Promise<{
        admin: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        }[];
        member: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        }[];
    }>;
}
