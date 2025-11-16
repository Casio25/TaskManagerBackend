import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter;
  private readonly from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    this.from = process.env.MAIL_FROM || 'no-reply@example.com';
    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP configured: ${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP is not fully configured. Emails will be logged to console.',
      );
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (this.transporter) {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to} | ${subject}`);
    } else {
      this.logger.warn(`EMAIL MOCK → To: ${to}\nSubject: ${subject}\n${html}`);
    }
  }
}
