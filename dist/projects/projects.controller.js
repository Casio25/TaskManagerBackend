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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const projects_service_1 = require("./projects.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const create_project_invite_dto_1 = require("./dto/create-project-invite.dto");
const accept_project_invite_dto_1 = require("./dto/accept-project-invite.dto");
const mail_service_1 = require("../mail/mail.service");
let ProjectsController = class ProjectsController {
    projects;
    mail;
    constructor(projects, mail) {
        this.projects = projects;
        this.mail = mail;
    }
    async create(req, dto) {
        return this.projects.createProject(req.user.id, dto);
    }
    async invite(req, id, dto) {
        const { invite, token } = await this.projects.createInvite(id, req.user.id, dto);
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const link = `${appUrl}/projects/invitations/accept?token=${encodeURIComponent(token)}`;
        await this.mail.sendMail(dto.email, 'Project invitation', `<p>You have been invited to join project <b>${id}</b>.</p><p>Follow the link: <a href="${link}">${link}</a></p>`);
        return { invite, link };
    }
    async accept(req, dto) {
        return this.projects.acceptInvite(req.user.id, req.user.email, dto);
    }
    async mine(req) {
        return this.projects.myProjects(req.user.id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/invitations'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, create_project_invite_dto_1.CreateProjectInviteDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)('invitations/accept'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, accept_project_invite_dto_1.AcceptProjectInviteDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "accept", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "mine", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService, mail_service_1.MailService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map