import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  description: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  time: string;
}

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  waiting: 'bg-warning text-warning-foreground',
  ready: 'bg-info text-info-foreground',
  done: 'bg-success text-success-foreground',
  canceled: 'bg-destructive text-destructive-foreground',
};

const typeColors = {
  receipt: 'text-success',
  delivery: 'text-info',
  transfer: 'text-warning',
  adjustment: 'text-destructive',
};

export const RecentActivity = () => {
  // Empty state - no database data available
  const activities: Activity[] = [];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No recent activity to display
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Database is empty - activities will appear here when operations are performed
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-sm font-medium capitalize",
                      typeColors[activity.type]
                    )}>
                      {activity.type}
                    </span>
                    <Badge className={cn("text-xs", statusColors[activity.status])}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
