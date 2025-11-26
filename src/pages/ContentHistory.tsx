import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Copy, Check, Download, Trash2, CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ContentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchDelete, setShowBatchDelete] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [newScheduledDate, setNewScheduledDate] = useState<Date>();
  const [newScheduledTime, setNewScheduledTime] = useState("12:00");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ["content-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredContent = content?.filter((item) => {
    const matchesSearch = 
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "all" || item.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("content")
        .delete()
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["content-history"] });
      toast({
        title: "Deleted!",
        description: `${ids.length} item${ids.length > 1 ? 's' : ''} removed from history`,
      });
      setDeleteId(null);
      setShowBatchDelete(false);
      setSelectedIds([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!filteredContent) return;
    if (selectedIds.length === filteredContent.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContent.map(item => item.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setShowBatchDelete(true);
  };

  const confirmBatchDelete = () => {
    deleteMutation.mutate(selectedIds);
  };

  const regenerateMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Get the selected content items
      const itemsToRegenerate = content?.filter(item => ids.includes(item.id));
      if (!itemsToRegenerate) return;

      // Regenerate each item
      const results = await Promise.all(
        itemsToRegenerate.map(async (item) => {
          const { error } = await supabase.functions.invoke('generate-content', {
            body: { topic: item.topic, platform: item.platform }
          });
          if (error) throw error;
        })
      );
      
      return results;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["content-history"] });
      toast({
        title: "Regenerated!",
        description: `${ids.length} new variation${ids.length > 1 ? 's' : ''} created`,
      });
      setSelectedIds([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to regenerate content",
        variant: "destructive",
      });
    },
  });

  const handleRegenerate = () => {
    if (selectedIds.length === 0) return;
    regenerateMutation.mutate(selectedIds);
  };

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string | null }) => {
      const { error } = await supabase
        .from('content')
        .update({ 
          scheduled_at: scheduledAt,
          status: scheduledAt ? 'scheduled' : 'draft'
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-history"] });
      setEditingSchedule(null);
      toast({
        title: "Schedule updated",
        description: "Content schedule has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    },
  });

  const handleScheduleEdit = (id: string, currentSchedule: string | null) => {
    setEditingSchedule(id);
    if (currentSchedule) {
      const date = new Date(currentSchedule);
      setNewScheduledDate(date);
      setNewScheduledTime(format(date, "HH:mm"));
    } else {
      setNewScheduledDate(undefined);
      setNewScheduledTime("12:00");
    }
  };

  const handleScheduleSave = (id: string) => {
    if (!newScheduledDate) {
      updateScheduleMutation.mutate({ id, scheduledAt: null });
      return;
    }

    const [hours, minutes] = newScheduledTime.split(':');
    const dateTime = new Date(newScheduledDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    updateScheduleMutation.mutate({ id, scheduledAt: dateTime.toISOString() });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis: { [key: string]: string } = {
      twitter: "𝕏",
      linkedin: "💼",
      instagram: "📸",
    };
    return emojis[platform.toLowerCase()] || "📱";
  };

  const exportToJSON = () => {
    const dataToExport = selectedIds.length > 0
      ? content?.filter(item => selectedIds.includes(item.id))
      : filteredContent;

    if (!dataToExport || dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no content to export",
        variant: "destructive",
      });
      return;
    }

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `content-history-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: `${dataToExport.length} item${dataToExport.length > 1 ? 's' : ''} exported as JSON`,
    });
    setSelectedIds([]);
  };

  const exportToCSV = () => {
    const dataToExport = selectedIds.length > 0
      ? content?.filter(item => selectedIds.includes(item.id))
      : filteredContent;

    if (!dataToExport || dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no content to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Platform", "Topic", "Content", "Status"];
    const rows = dataToExport.map((item) => [
      new Date(item.created_at).toLocaleString(),
      item.platform,
      item.topic,
      `"${item.content.replace(/"/g, '""')}"`,
      item.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `content-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: `${dataToExport.length} item${dataToExport.length > 1 ? 's' : ''} exported as CSV`,
    });
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Content History</h1>
            <p className="text-muted-foreground">
              View and manage all your generated content
            </p>
          </div>

          {/* Filters and Batch Actions */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Search and filter your content</CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedIds.length > 0 && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRegenerate}
                        disabled={regenerateMutation.isPending}
                      >
                        {regenerateMutation.isPending ? "Regenerating..." : `Regenerate (${selectedIds.length})`}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBatchDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedIds.length})
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV {selectedIds.length > 0 && `(${selectedIds.length})`}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToJSON}>
                    <Download className="h-4 w-4 mr-2" />
                    JSON {selectedIds.length > 0 && `(${selectedIds.length})`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by topic or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || platformFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setPlatformFilter("all");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading content...</p>
            </div>
          ) : filteredContent && filteredContent.length > 0 ? (
            <>
              {/* Select All Header */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  checked={selectedIds.length === filteredContent.length}
                  onCheckedChange={toggleSelectAll}
                  id="select-all"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  {selectedIds.length > 0
                    ? `${selectedIds.length} selected`
                    : "Select all"}
                </label>
              </div>

              <div className="grid gap-4">
                {filteredContent.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => toggleSelection(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="flex items-center gap-2">
                              <span>{getPlatformEmoji(item.platform)}</span>
                              <span className="capitalize">{item.platform}</span>
                            </CardTitle>
                            {item.status === 'scheduled' && item.scheduled_at && (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                {format(new Date(item.scheduled_at), "MMM d, HH:mm")}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-1">
                            Topic: {item.topic}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.content, item.id)}
                          >
                            {copiedId === item.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScheduleEdit(item.id, item.scheduled_at)}
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm mb-4">{item.content}</p>
                      
                      {editingSchedule === item.id && (
                        <div className="mt-4 p-4 border rounded-lg space-y-3 bg-muted/30">
                          <Label>Update Schedule</Label>
                          <div className="flex gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal flex-1",
                                    !newScheduledDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newScheduledDate ? format(newScheduledDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={newScheduledDate}
                                  onSelect={setNewScheduledDate}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            
                            <input
                              type="time"
                              value={newScheduledTime}
                              onChange={(e) => setNewScheduledTime(e.target.value)}
                              className="px-3 py-2 border rounded-md bg-background"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleScheduleSave(item.id)}
                              disabled={updateScheduleMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSchedule(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm || platformFilter !== "all"
                    ? "No content matches your filters"
                    : "No content generated yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialogs */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Content?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this content from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate([deleteId])}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showBatchDelete} onOpenChange={setShowBatchDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedIds.length} Items?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {selectedIds.length} item
                {selectedIds.length > 1 ? 's' : ''} from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBatchDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ContentHistory;
