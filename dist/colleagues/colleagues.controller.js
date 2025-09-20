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
exports.ColleaguesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const colleagues_service_1 = require("./colleagues.service");
const create_colleague_dto_1 = require("./dto/create-colleague.dto");
const assign_project_dto_1 = require("./dto/assign-project.dto");
const assign_task_dto_1 = require("./dto/assign-task.dto");
const create_list_dto_1 = require("./dto/create-list.dto");
const add_to_list_dto_1 = require("./dto/add-to-list.dto");
let ColleaguesController = class ColleaguesController {
    colleagues;
    constructor(colleagues) {
        this.colleagues = colleagues;
    }
    list(req) {
        return this.colleagues.list(req.user.id);
    }
    create(req, dto) {
        return this.colleagues.create(req.user.id, dto);
    }
    lists(req) {
        return this.colleagues.listLists(req.user.id);
    }
    createList(req, dto) {
        return this.colleagues.createList(req.user.id, dto);
    }
    addToList(req, id, dto) {
        return this.colleagues.addToList(req.user.id, id, dto);
    }
    assignProject(req, id, dto) {
        return this.colleagues.assignProject(req.user.id, id, dto);
    }
    assignTask(req, id, dto) {
        return this.colleagues.assignTask(req.user.id, id, dto);
    }
};
exports.ColleaguesController = ColleaguesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ColleaguesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_colleague_dto_1.CreateColleagueDto]),
    __metadata("design:returntype", void 0)
], ColleaguesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('lists'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ColleaguesController.prototype, "lists", null);
__decorate([
    (0, common_1.Post)('lists'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_list_dto_1.CreateListDto]),
    __metadata("design:returntype", void 0)
], ColleaguesController.prototype, "createList", null);
__decorate([
    (0, common_1.Post)('lists/:id/members'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, add_to_list_dto_1.AddToListDto]),
    __metadata("design:returntype", void 0)
], ColleaguesController.prototype, "addToList", null);
__decorate([
    (0, common_1.Post)(':id/assign-project'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, assign_project_dto_1.AssignProjectDto]),
    __metadata("design:returntype", void 0)
], ColleaguesController.prototype, "assignProject", null);
__decorate([
    (0, common_1.Post)(':id/assign-task'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, assign_task_dto_1.AssignTaskDto]),
    __metadata("design:returntype", void 0)
], ColleaguesController.prototype, "assignTask", null);
exports.ColleaguesController = ColleaguesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('colleagues'),
    __metadata("design:paramtypes", [colleagues_service_1.ColleaguesService])
], ColleaguesController);
//# sourceMappingURL=colleagues.controller.js.map