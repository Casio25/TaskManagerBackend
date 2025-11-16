import { AnalyticsService, TeamAnalyticsResponse } from './analytics.service';
import { Request } from 'express';
type AuthenticatedRequest = Request & {
    user: {
        id: number;
    };
};
export declare class AnalyticsController {
    private readonly analytics;
    constructor(analytics: AnalyticsService);
    teamAnalytics(req: AuthenticatedRequest, listId: number, from?: string, to?: string): Promise<TeamAnalyticsResponse>;
}
export {};
