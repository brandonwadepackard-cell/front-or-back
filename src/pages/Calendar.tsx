import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  topic: string;
  platform: string;
  content: string;
  scheduled_at: string | null;
  status: string;
}

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scheduledContent, isLoading } = useQuery({
    queryKey: ["scheduled-content", format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("status", "scheduled")
        .not("scheduled_at", "is", null)
        .gte("scheduled_at", monthStart.toISOString())
        .lte("scheduled_at", monthEnd.toISOString())
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as ContentItem[];
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, newDate }: { id: string; newDate: Date }) => {
      const { error } = await supabase
        .from("content")
        .update({ scheduled_at: newDate.toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
      toast({
        title: "Rescheduled!",
        description: "Content has been rescheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reschedule content",
        variant: "destructive",
      });
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getContentForDate = (date: Date) => {
    if (!scheduledContent) return [];
    return scheduledContent.filter((item) => {
      if (!item.scheduled_at) return false;
      return isSameDay(new Date(item.scheduled_at), date);
    });
  };

  const handleDragStart = (item: ContentItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date) => {
    if (!draggedItem || !draggedItem.scheduled_at) return;

    const originalDate = new Date(draggedItem.scheduled_at);
    const newDate = new Date(date);
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

    rescheduleMutation.mutate({ id: draggedItem.id, newDate });
    setDraggedItem(null);
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis: Record<string, string> = {
      twitter: "𝕏",
      linkedin: "💼",
      instagram: "📸",
      all: "🌐",
    };
    return emojis[platform.toLowerCase()] || "📱";
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Content Calendar</h1>
              <p className="text-muted-foreground">
                Visualize and manage scheduled content
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={today}>
                Today
              </Button>
              <h2 className="text-2xl font-semibold min-w-[200px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button variant="outline" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-sm text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const dayContent = getContentForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "min-h-[120px] border rounded-lg p-2 transition-colors",
                          isCurrentMonth ? "bg-background" : "bg-muted/30",
                          isToday && "border-primary border-2",
                          "hover:bg-accent/50"
                        )}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(day)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              !isCurrentMonth && "text-muted-foreground",
                              isToday && "text-primary font-bold"
                            )}
                          >
                            {format(day, "d")}
                          </span>
                          {dayContent.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {dayContent.length}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          {dayContent.map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => handleDragStart(item)}
                              className={cn(
                                "p-2 rounded text-xs cursor-move",
                                "bg-primary/10 hover:bg-primary/20",
                                "border border-primary/20",
                                "transition-all duration-200",
                                draggedItem?.id === item.id && "opacity-50"
                              )}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <span>{getPlatformEmoji(item.platform)}</span>
                                <span className="font-medium truncate flex-1">
                                  {item.topic}
                                </span>
                              </div>
                              {item.scheduled_at && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{format(new Date(item.scheduled_at), "HH:mm")}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How to use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Drag and drop content cards between dates to reschedule</p>
              <p>• The time of day is preserved when moving content</p>
              <p>• Click on content cards to view details (coming soon)</p>
              <p>• Badge numbers show how many posts are scheduled for each day</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
