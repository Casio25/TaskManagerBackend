export declare class MailService {
    private readonly logger;
    private transporter?;
    private readonly from;
    constructor();
    sendMail(to: string, subject: string, html: string): Promise<void>;
}
