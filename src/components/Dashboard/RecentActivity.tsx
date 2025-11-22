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
  // Mock data - will be replaced with Firebase/MongoDB data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'receipt',
      description: 'Received 100 units of Steel Rods from Supplier A',
      status: 'done',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'delivery',
      description: 'Delivered 50 units of Office Chairs to Customer B',
      status: 'ready',
      time: '4 hours ago'
    },
    {
      id: '3',
      type: 'transfer',
      description: 'Transferred 30 units from Warehouse A to Production Floor',
      status: 'waiting',
      time: '6 hours ago'
    },
    {
      id: '4',
      type: 'adjustment',
      description: 'Adjusted inventory for damaged items (-5 units)',
      status: 'done',
      time: '1 day ago'
    },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
