import { LinksService } from './linksService';
import { DealsService } from './dealsService';
import { I2WEService } from './i2weService';
import { Activity } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export const ActivityService = {
    async getRecentActivities(limit: number = 20): Promise<Activity[]> {
        try {
            // Fetch data concurrently
            const [links, deals, meetings] = await Promise.all([
                LinksService.getMyLinks().catch(() => []),
                DealsService.getMyDeals().catch(() => []),
                I2WEService.getMyMeetings().catch(() => []),
            ]);

            const activities: Activity[] = [];

            // Map Links
            links.forEach((link) => {
                activities.push({
                    id: `link-${link.id}`,
                    type: 'link',
                    title: `Link to ${link.contact_name}`,
                    message: link.description || `New link created. Urgency: ${link.urgency}/10`,
                    timestamp: link.created_at,
                    action_label: 'View',
                });
            });

            // Map Deals
            deals.forEach((deal) => {
                activities.push({
                    id: `deal-${deal.id}`,
                    type: 'deal',
                    title: deal.title,
                    message: deal.description || `Deal Amount: ₹${deal.amount}`,
                    timestamp: deal.created_at,
                    action_label: 'View',
                });
            });

            // Map Meetings
            meetings.forEach((meeting) => {
                activities.push({
                    id: `meeting-${meeting.id}`,
                    type: 'meeting',
                    title: 'I2WE Meeting',
                    message: meeting.notes || `Meeting Scheduled for ${new Date(meeting.meeting_date).toLocaleDateString()}`,
                    timestamp: meeting.created_at,
                    action_label: 'Details',
                });
            });

            // Sort by combined timestamp (most recent first)
            const sortedActivities = activities.sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

            // Format timestamp to '... ago' string
            const formattedActivities = sortedActivities.slice(0, limit).map((activity) => ({
                ...activity,
                timestamp: formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }),
            }));

            return formattedActivities;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            return [];
        }
    },
};
