import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Clock, Copy, Check, CalendarIcon, Trash2 } from "lucide-react";
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
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedStatus, setEditedStatus] = useState("scheduled");
  const [editedDate, setEditedDate] = useState<Date>();
  const [editedTime, setEditedTime] = useState("12:00");
  const [copied, setCopied] = useState(false);
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

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContentItem> }) => {
      const { error } = await supabase
        .from("content")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
      setSelectedItem(null);
      setIsEditing(false);
      toast({
        title: "Updated!",
        description: "Content has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
      setSelectedItem(null);
      toast({
        title: "Deleted!",
        description: "Content has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete content",
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

  const handleItemClick = (item: ContentItem, e: React.MouseEvent) => {
    // Prevent click when dragging
    if (draggedItem) return;
    
    e.stopPropagation();
    setSelectedItem(item);
    setEditedContent(item.content);
    setEditedStatus(item.status);
    if (item.scheduled_at) {
      const scheduledDate = new Date(item.scheduled_at);
      setEditedDate(scheduledDate);
      setEditedTime(format(scheduledDate, "HH:mm"));
    }
  };

  const handleSaveChanges = () => {
    if (!selectedItem) return;

    let scheduledAt = selectedItem.scheduled_at;
    if (editedDate && editedStatus === 'scheduled') {
      const [hours, minutes] = editedTime.split(':');
      const dateTime = new Date(editedDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      scheduledAt = dateTime.toISOString();
    } else if (editedStatus !== 'scheduled') {
      scheduledAt = null;
    }

    updateContentMutation.mutate({
      id: selectedItem.id,
      updates: {
        content: editedContent,
        status: editedStatus,
        scheduled_at: scheduledAt,
      },
    });
  };

  const handleCopyContent = async () => {
    if (!selectedItem) return;
    
    try {
      await navigator.clipboard.writeText(selectedItem.content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    deleteMutation.mutate(selectedItem.id);
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

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      twitter: "bg-platform-twitter/10 hover:bg-platform-twitter/20 border-platform-twitter/30 text-platform-twitter-foreground",
      linkedin: "bg-platform-linkedin/10 hover:bg-platform-linkedin/20 border-platform-linkedin/30 text-platform-linkedin-foreground",
      instagram: "bg-platform-instagram/10 hover:bg-platform-instagram/20 border-platform-instagram/30 text-platform-instagram-foreground",
      all: "bg-platform-all/10 hover:bg-platform-all/20 border-platform-all/30 text-platform-all-foreground",
    };
    return colors[platform.toLowerCase()] || "bg-primary/10 hover:bg-primary/20 border-primary/20";
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
                              onClick={(e) => handleItemClick(item, e)}
                              className={cn(
                                "p-2 rounded text-xs cursor-pointer",
                                getPlatformColor(item.platform),
                                "border",
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
              <p>• Click on content cards to view and edit details</p>
              <p>• The time of day is preserved when moving content</p>
              <p>• Badge numbers show how many posts are scheduled for each day</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Detail Modal */}
        <Dialog open={!!selectedItem} onOpenChange={() => {
          setSelectedItem(null);
          setIsEditing(false);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{selectedItem && getPlatformEmoji(selectedItem.platform)}</span>
                <span className="capitalize">{selectedItem?.platform}</span>
                {selectedItem && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedItem.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Topic: {selectedItem?.topic}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editedStatus} onValueChange={setEditedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editedStatus === 'scheduled' && (
                    <div className="space-y-2">
                      <Label>Schedule Date & Time</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal flex-1",
                                !editedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editedDate ? format(editedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarPicker
                              mode="single"
                              selected={editedDate}
                              onSelect={setEditedDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <input
                          type="time"
                          value={editedTime}
                          onChange={(e) => setEditedTime(e.target.value)}
                          className="px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                      {selectedItem?.content}
                    </div>
                  </div>

                  {selectedItem?.scheduled_at && (
                    <div className="space-y-2">
                      <Label>Scheduled For</Label>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(selectedItem.scheduled_at), "PPP 'at' p")}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{selectedItem && getPlatformEmoji(selectedItem.platform)}</span>
                      <span className="capitalize">{selectedItem?.platform}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (selectedItem) {
                        setEditedContent(selectedItem.content);
                        setEditedStatus(selectedItem.status);
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={updateContentMutation.isPending}
                  >
                    {updateContentMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCopyContent}
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
