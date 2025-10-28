import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DesignerProfileCompletionBannerProps {
  status: string;
  designerName?: string;
  bio?: string;
  totalDesigns: number;
}

export function DesignerProfileCompletionBanner({
  status,
  designerName,
  bio,
  totalDesigns
}: DesignerProfileCompletionBannerProps) {
  // Calculate completion percentage
  const fields = [
    { name: 'Designer Name', filled: !!designerName },
    { name: 'Bio', filled: !!bio && bio.length > 20 },
    { name: 'At least one design', filled: totalDesigns > 0 }
  ];

  const completedFields = fields.filter(f => f.filled).length;
  const completionPercentage = Math.round((completedFields / fields.length) * 100);

  const isPending = status === 'pending';
  const isActive = status === 'active';

  return (
    <Card className={`border-2 ${isPending ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20'}`}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPending ? (
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {isPending ? 'Application Under Review' : 'Profile Active'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isPending 
                  ? 'Complete your profile to help speed up approval' 
                  : 'Your designer account is active'}
              </p>
            </div>
          </div>
          <Badge variant={isPending ? 'secondary' : 'default'}>
            {isPending ? 'Pending' : 'Active'}
          </Badge>
        </div>

        {isPending && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Profile Completion</span>
                <span className="text-muted-foreground">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Checklist:</p>
              <ul className="space-y-2">
                {fields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    {field.filled ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={field.filled ? 'text-foreground' : 'text-muted-foreground'}>
                      {field.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {completionPercentage < 100 && (
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Tip:</strong> A complete profile with designs helps our team review your application faster. 
                  Add a detailed bio and upload at least one design to get started!
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
