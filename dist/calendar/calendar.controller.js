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
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const calendar_service_1 = require("./calendar.service");
function parseRange(query) {
    const range = {};
    if (query.from) {
        const from = new Date(query.from);
        if (!isNaN(from.getTime()))
            range.from = from;
    }
    if (query.to) {
        const to = new Date(query.to);
        if (!isNaN(to.getTime()))
            range.to = to;
    }
    return range;
}
let CalendarController = class CalendarController {
    calendar;
    constructor(calendar) {
        this.calendar = calendar;
    }
    myCalendar(req, query) {
        return this.calendar.userCalendar(req.user.id, parseRange(query));
    }
    projectCalendar(req, id, query) {
        return this.calendar.projectCalendar(req.user.id, id, parseRange(query));
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "myCalendar", null);
__decorate([
    (0, common_1.Get)('project/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "projectCalendar", null);
exports.CalendarController = CalendarController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map