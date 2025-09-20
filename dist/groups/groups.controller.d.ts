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
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        adminId: number;
    }>;
    invite(req: any, id: number, dto: CreateGroupInviteDto): Promise<{
        invite: {
            email: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            groupId: number;
            status: import(".prisma/client").$Enums.InvitationStatus;
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
            email: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            groupId: number;
            status: import(".prisma/client").$Enums.InvitationStatus;
            invitedById: number;
            tokenHash: string;
            expiresAt: Date | null;
            acceptedById: number | null;
            acceptedAt: Date | null;
        };
    }>;
    myGroups(req: any): Promise<{
        admin: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        }[];
        member: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            adminId: number;
        }[];
    }>;
}
