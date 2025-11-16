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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = require("nodemailer");
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    from;
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT
            ? parseInt(process.env.SMTP_PORT, 10)
            : undefined;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        this.from = process.env.MAIL_FROM || 'no-reply@example.com';
        if (host && port && user && pass) {
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
            this.logger.log(`SMTP configured: ${host}:${port}`);
        }
        else {
            this.logger.warn('SMTP is not fully configured. Emails will be logged to console.');
        }
    }
    async sendMail(to, subject, html) {
        if (this.transporter) {
            await this.transporter.sendMail({ from: this.from, to, subject, html });
            this.logger.log(`Email sent to ${to} | ${subject}`);
        }
        else {
            this.logger.warn(`EMAIL MOCK → To: ${to}\nSubject: ${subject}\n${html}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map