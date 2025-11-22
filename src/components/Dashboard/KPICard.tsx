import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'warning' | 'success' | 'info' | 'destructive';
}

export const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: KPICardProps) => {
  const variantStyles = {
    default: 'bg-gradient-primary',
    warning: 'bg-gradient-to-br from-warning to-warning/80',
    success: 'bg-gradient-to-br from-success to-success/80',
    info: 'bg-gradient-to-br from-info to-info/80',
    destructive: 'bg-gradient-to-br from-destructive to-destructive/80',
  };

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-sm mt-2",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-xl p-3",
            variantStyles[variant]
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
