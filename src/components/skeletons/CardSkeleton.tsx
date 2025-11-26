import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CardSkeleton = () => {
  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
};

export const StatCardSkeleton = () => {
  return (
    <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  );
};

export const ChartSkeleton = () => {
  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
};

export const ContentListSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border border-border/50 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TemplateCardSkeleton = () => {
  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="h-2 bg-muted" />
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-8 rounded" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl border border-border/30">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
};

export const QuickActionSkeleton = () => {
  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm overflow-hidden h-full">
      <div className="h-1 bg-muted" />
      <CardHeader className="pb-3">
        <Skeleton className="h-14 w-14 rounded-2xl mb-3" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
    </Card>
  );
};
