import { PrismaService } from '../prisma/prisma.service';
interface TeamAnalyticsQuery {
    from?: string;
    to?: string;
}
export interface RatingAggregate {
    count: number;
    punctuality: number;
    teamwork: number;
    quality: number;
    overall: number;
}
export interface OverdueAggregate {
    total: number;
    withDeadline: number;
    overdue: number;
    share: number | null;
}
export interface TeamAnalyticsTopPerformer {
    userId: number;
    name: string;
    email: string;
    ratingsCount: number;
    punctuality: number;
    teamwork: number;
    quality: number;
    overall: number;
}
export interface TeamAnalyticsResponse {
    list: {
        id: number;
        name: string;
        members: number;
        connectedMembers: number;
    };
    filters: {
        from: string | null;
        to: string | null;
    };
    ratingAverages: RatingAggregate | null;
    taskOverdue: OverdueAggregate;
    topPerformers: TeamAnalyticsTopPerformer[];
}
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    teamAnalytics(ownerId: number, listId: number, query: TeamAnalyticsQuery): Promise<TeamAnalyticsResponse>;
    private parseDate;
    private buildDateRange;
    private computeRatingAverages;
    private buildTopPerformers;
    private computeOverdueShare;
}
export {};
