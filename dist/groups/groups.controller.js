"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const groups_service_1 = require("./groups.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_group_dto_1 = require("./dto/create-group.dto");
const create_group_invite_dto_1 = require("./dto/create-group-invite.dto");
const accept_group_invite_dto_1 = require("./dto/accept-group-invite.dto");
const mail_service_1 = require("../mail/mail.service");
let GroupsController = class GroupsController {
    groups;
    mail;
    constructor(groups, mail) {
        this.groups = groups;
        this.mail = mail;
    }
    async create(req, dto) {
        return this.groups.createGroup(req.user.id, dto);
    }
    async invite(req, id, dto) {
        const { invite, token } = await this.groups.createInvite(id, req.user.id, dto);
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const link = `${appUrl}/groups/invitations/accept?token=${encodeURIComponent(token)}`;
        await this.mail.sendMail(dto.email, 'Group invitation', `<p>You have been invited to join group <b>${id}</b>.</p><p>Follow the link: <a href="${link}">${link}</a></p>`);
        return { invite, link };
    }
    async accept(req, dto) {
        return this.groups.acceptInvite(req.user.id, req.user.email, dto);
    }
    async myGroups(req) {
        const userId = req.user.id;
        const admin = await this.groups['prisma'].group.findMany({ where: { adminId: userId } });
        const memberLinks = await this.groups['prisma'].userGroup.findMany({ where: { userId }, include: { group: true } });
        const member = memberLinks.map((l) => l.group);
        return { admin, member };
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_group_dto_1.CreateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/invitations'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, create_group_invite_dto_1.CreateGroupInviteDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)('invitations/accept'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, accept_group_invite_dto_1.AcceptGroupInviteDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "accept", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "myGroups", null);
exports.GroupsController = GroupsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService, mail_service_1.MailService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map